import React, { Component } from 'react';
import $ from 'jquery'
import {
  isSignInPending,
  loadUserData,
  Person,
  putFile, 
  getFile,
  lookupProfile
} from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
      imgJson: "1",
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
      },
      username: "",
      newStatus: "",
      statuses: [],
      statusIndex: 0,
      isLoading: false,
  	};
  }

  render() {
    const { handleSignOut } = this.props;
    const { person } = this.state;
    const { username } = this.state;
    return (
      !isSignInPending() && person ?
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                    </h1>
                  <span>{username}</span>
                  <span>
                    &nbsp;|&nbsp;
                    <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                  </span>
                </div>
              </div>
            </div>
 
            <div className="new-status">
              {/* <div className="col-md-12 statuses">
                {this.state.isLoading && <span>Loading...</span>}
                {this.state.statuses.map((status) => (
                  <div className="status" key={status.id}>
                    {status.text}
                  </div>
                ))}
              </div> */}
              <div className="col-md-12">
                <textarea className="input-status"
                  value={this.state.newStatus}
                  onChange={e => this.handleNewStatusChange(e)}
                  placeholder="Enter Your ID"
                />
              </div>
              <div className="col-md-12">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={e => this.handleNewStatusSubmit(e)}
                >
                  Submit
                </button>
              </div>
            </div>
 
          </div>
        </div>
      </div> : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    });
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }

  handleNewStatusSubmit(event) {
    this.setState({imgJson:"1"})
    const ppurl = 'https://gaia.blockstack.org/hub/'+this.state.newStatus+'/passport.json'
    // fetch(ppurl)
    //   .then(response => response.json())
    //   .then(console.log(response))
    $.getJSON('https://gaia.blockstack.org/hub/'+this.state.newStatus+'/passport.json', function(data) {

     var image = new Image();
     image.src = 'data:image/png;base64,'+data[0].text;


     document.body.appendChild(image);

     // document.getElementById("avatar-image").append(image);

     // var oImg = document.createElement("img");
     // oImg.setAttribute('src', image.src);
     // oImg.setAttribute('alt', 'na');
     // oImg.setAttribute('height', '500px');
     // oImg.setAttribute('width', '500px');
     // document.body.appendChild(oImg);

   //data is the JSON string
});
    this.saveNewStatus(this.state.newStatus)
    this.setState({
      newStatus: ""
    })
  }

  saveNewStatus(statusText) {
    let statuses = this.state.statuses
 
    let status = {
      id: this.state.statusIndex++,
      text: statusText.trim(),
      created_at: Date.now()
    }
 
    statuses.unshift(status)
    const options = { encrypt: false }
    putFile('test3.json', JSON.stringify(statuses), options)
      .then(() => {
        this.setState({
          statuses: statuses
        })
      })
  }

  fetchData() {
    this.setState({ isLoading: true })
    const options = { decrypt: false }
    getFile('test3.json', options)
      .then((file) => {
        var statuses = JSON.parse(file || '[]')
        this.setState({
          person: new Person(loadUserData().profile),
          username: loadUserData().username,
          statusIndex: statuses.length,
          statuses: statuses,
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  componentDidMount() {
    this.fetchData()
  }
 
}