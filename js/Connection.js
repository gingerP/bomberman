class BMConnection extends BMObservable {
  constructor() {
    super();
    this.id = `connection-${BMUtils.randomString(20)}`;
    this.remotes = [];
    this.listeners = {};
    this.teamStatus = null;
  }

  async initConnection() {
    this.localConnection = new RTCPeerConnection();
    const defered = BMUtils.deferred();
    this.iceCandidates = [];
    this.iceCandidatesPromise = defered.promise;
    this.localConnection.onicecandidate = (event) => {
      if (event.candidate === null) {
        defered.resolve(this.iceCandidates);
        return;
      }
      this.iceCandidates.push(event.candidate);
    };
    this.chanel = this.localConnection.createDataChannel('bomberman-transport', {ordered: true});

    this.chanel.onopen = async () => {
      console.log('Connection established.');
      await this.emit('connection-opened');
    };

    this.chanel.onclose = async () => {
      console.log('Connection closed.');
      await this.emit('connection-closed');
    };

    this.localConnection.ondatachannel = (dataChannelEvent) => {
      const receiveChannel = dataChannelEvent.channel;
      receiveChannel.binaryType = 'arraybuffer';
      receiveChannel.onmessage = async (event) => {
        await this.emit('message-received', JSON.parse(event.data));
      };
    };
    this.localConnection.oniceconnectionstatechange = async () => {
      if (this.localConnection.iceConnectionState === 'disconnected') {
        console.log('Connection closed.');
        await this.emit('connection-closed');
      }
    };
  }

  getId() {
    return this.id;
  }

  async generateLocalSdp() {
    const offer = await this.localConnection.createOffer();
    this.offer = offer;
    this.localConnection.setLocalDescription(offer);
  }

  // 1 Step
  async createOffer() {
    this.teamStatus = TeamStatuses.MASTER;
    await this.initConnection();
    await this.generateLocalSdp();
    if (!this.iceCandidates.length) {
      await this.iceCandidatesPromise;
    }
    const body = {
      ice: this.iceCandidates,
      sdp: this.offer
    };
    return btoa(JSON.stringify(body));
  }

  // 2 Step
  async submitOfferReceiving(offerBase64) {
    this.teamStatus = TeamStatuses.SLAVE;
    if (!this.localConnection) {
      await this.initConnection();
    }
    const remoteOffer = JSON.parse(atob(offerBase64));
    this.remotes.push(remoteOffer);
    this.localConnection.setRemoteDescription(remoteOffer.sdp);

    if (remoteOffer.ice && remoteOffer.ice.length) {
      remoteOffer.ice.forEach((ice) => {
        this.localConnection.addIceCandidate(ice);
      });
    }

    const localAnswer = await this.localConnection.createAnswer();
    this.localConnection.setLocalDescription(localAnswer);
    if (!this.iceCandidates.length) {
      await this.iceCandidatesPromise;
    }
    const body = {
      ice: this.iceCandidates,
      sdp: localAnswer
    };
    return btoa(JSON.stringify(body));
  }

  // 3 Step
  async submitOfferCreation(answerBase64) {
    this.teamStatus = TeamStatuses.MASTER;
    try {
      const remoteAnswer = JSON.parse(atob(answerBase64));
      this.remotes.push(remoteAnswer);
      this.localConnection.setRemoteDescription(remoteAnswer.sdp);

      if (remoteAnswer.ice && remoteAnswer.ice.length) {
        for (const ice of remoteAnswer.ice) {
          await this.localConnection.addIceCandidate(ice);
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTeamStatus() {
    return this.teamStatus;
  }

  isMaster() {
    return this.teamStatus === TeamStatuses.MASTER;
  }

  isSlave() {
    return this.teamStatus === TeamStatuses.SLAVE;
  }

  async send(message) {
    if (!this.chanel) {
      return;
    }
    if (this.chanel.readyState === 'open') {
      try {
        const messageString = JSON.stringify(message);
        console.log('Message length: ' + messageString.length);
        await this.chanel.send(messageString);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
}
