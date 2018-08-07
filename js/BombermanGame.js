class BombermanGame {
  constructor() {
    this.remotes = [];
    this.view = new BombermanGameView();
    this.bindView();
    this.offerAction = '';
    this.offerActions = {
      CREATE: 'create',
      RECEIVE: 'receive'
    };
  }

  async initConnection() {
    this.localConnection = new RTCPeerConnection();
    const defered = BombermanUtils.deferred();
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
    // this.chanel.binaryType = 'arraybuffer';
    this.chanel.onopen = () => {
      if (this.chanel.readyState === 'open') {
        this.chanel.send('Hello from XXX.');
      }
    };
    this.chanel.onclose = () => {
    };

    this.localConnection.ondatachannel = (dataChannelEvent) => {
      function onReceiveMessageCallback(event) {
        console.info('onReceiveMessageCallback');
        console.info(event.data);
      }

      const receiveChannel = dataChannelEvent.channel;
      receiveChannel.binaryType = 'arraybuffer';
      receiveChannel.onmessage = onReceiveMessageCallback;
    };
  }

  async generateLocalSdp() {
    const offer = await this.localConnection.createOffer();
    this.offer = offer;
    this.localConnection.setLocalDescription(offer);
  }

  bindView() {
    this.view.onCreateOffer(async () => {
      await this.createOffer();
    });
    this.view.onReceiveOffer(() => {
      this.offerAction = this.offerActions.RECEIVE;
    });
    this.view.onSubmit(async () => {
      if (this.offerAction === this.offerActions.CREATE) {
        await this.submitOfferCreation();
      } else if (this.offerAction === this.offerActions.RECEIVE) {
        await this.submitOfferReceiving();
      }
    });
  }

  async createOffer() {
    await this.initConnection();
    await this.generateLocalSdp();
    if (!this.iceCandidates.length) {
      await this.iceCandidatesPromise;
    }
    const body = {
      ice: this.iceCandidates,
      sdp: this.offer
    };
    this.view.setLocalSdpForCreateOffer(btoa(JSON.stringify(body)));
    this.offerAction = this.offerActions.CREATE;
  }

  async submitOfferCreation() {
    try {
      const answerBase64 = this.view.getRemoteAnswerSdpForCreateOffer();
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

  async submitOfferReceiving() {
    if (!this.localConnection) {
      await this.initConnection();
    }
    const offerBase64 = this.view.getRemoteSdpForReceiveOffer();
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
    this.view.setLocalAnswerSdpForReceiveOffer(btoa(JSON.stringify(body)));
  }
}
