/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const pre = "```";

const baseCodeExample = `${pre}ts
import PeerData, { EventDispatcher, SocketChannel } from 'peer-data';

const servers = {
  iceServers: [
    {urls: "stun:stun.1.google.com:19302"}
  ]
};

const dispatcher = new EventDispatcher();
const peerData = new PeerData(dispatcher, servers);
const signaling = new SocketChannel(dispatcher, 'http://localhost:8080');

const room = peerData.connect('test-room');

room.on("participant", participant => {
  participant.on("message", payload => console.log("message", payload));

  participant.send('Hi mate! this is private message.');
})
${pre}`;

const description = `
PeerData is a library for bidirectional peer-to-peer transfers of arbitrary data using [RTCDataChannel](https://developer.mozilla.org/pl/docs/Web/API/RTCDataChannel). Simple *WebRTC* wrapper providing data channel abstraction.

[WebRTC](https://webrtc.org/) needs a messaging service to set up and maintain a *WebRTC* call.

The sender and receiver *RTCPeerConnections* run in web pages on different devices, and we need a way for them to communicate metadata.
For this, we use a signaling server: a server that can pass messages between *WebRTC* clients (peers).

[PeerDataServer](https://github.com/vardius/peer-data-server) - An **ready to use** example of signaling server on *Node* using [socket.io](http://socket.io/).
`;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;
    const pageUrl = page => `${baseUrl}${langPart}${page}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = props => (
      <h2 className="projectTitle">
        {props.title}
        <small>{props.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/logo.png`} />
        <div className="inner">
          <ProjectTitle tagline={siteConfig.tagline} title={siteConfig.title} />
          <Container className="codeSample">
            <MarkdownBlock>{baseCodeExample}</MarkdownBlock>
          </Container>
          <PromoSection>
            <Button href={docUrl("installation.html")}>Documentation</Button>
            <Button href={pageUrl("help")}>Help</Button>
            <Button href="https://github.com/vardius/peer-data">GitHub</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;
    const imgUrl = image => `${baseUrl}img/${image}`;

    const Block = props => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align={props.align || "center"}
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Description = () => (
      <Block background="light" align="left">
        {[
          {
            title:
              "What and Why ?",
            content: description,
            image: imgUrl("webrtc.png"),
            imageAlign: "left",
            imageLink: docUrl("installation.html")
          }
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => `${baseUrl}${langPart}${page}`;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl("users.html")}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Description />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
