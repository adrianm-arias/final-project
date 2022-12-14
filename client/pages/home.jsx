import React from 'react';
import parseRoute from '../lib/parse-route';
import AppContext from '../lib/app-context';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputIndex: '',
      bracket0: '',
      bracket1: '',
      bracket2: '',
      bracket3: '',
      bracket4: '',
      bracketName: '',
      bracketId: null,
      route: parseRoute(window.location.hash),
      confirmDelete: false
    };
    this.handleBracketDelete = this.handleBracketDelete.bind(this);
    this.confirmDeleteAlert = this.confirmDeleteAlert.bind(this);
    this.handleBracketNameChange = this.handleBracketNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.editBracketName = this.editBracketName.bind(this);
  }

  handleBracketNameChange(event) {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  confirmDeleteAlert() {

    return (
      <div className='d-flex justify-content-center'>
        <div className='alert alert-danger alert-dismissible fade show mt-3 d-flex justify-content-center' role='alert'>
          <div className='my-2'>
            <div className=''>
              <p className='text-center'>{`Are you sure you want to delete '${this.state.bracketName}' ?`}</p>
            </div>
            <div className='mt-4 d-flex justify-content-center'>
              <button type='button' className='btn-primary mx-2 cancel-btn' data-bs-dismiss='alert' aria-label='Close' onClick={() => this.setState({ confirmDelete: false, bracketName: '', bracketId: null })}>Cancel</button>
              <button className='btn-primary mx-2 delete-btn' onClick={ () => this.handleBracketDelete() }>Delete</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleBracketDelete() {
    const token = window.localStorage.getItem('react-jwt');
    const bracketId = this.state.bracketId;
    const { removeBracket } = this.context;

    fetch(`/api/brackets/${bracketId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      }
    })
      .then(result => {
        this.setState({
          confirmDelete: false,
          bracketName: '',
          bracketId: null
        });
        removeBracket(bracketId);
      })
      .catch(error => {
        console.error('error:', error);
      });
  }

  componentDidMount() {
    window.addEventListener('hashchange', event => {
      const newRoute = parseRoute(window.location.hash);
      this.setState({
        route: newRoute
      });
    });
  }

  handleSubmit(index, bracketId) {
    const { updateBrackets, user } = this.context;

    if (this.state[`bracket${index}`] === '') {
      this.setState({
        inputIndex: ''
      });
    } else {
      const token = window.localStorage.getItem('react-jwt');
      const newBracketName = {
        bracketName: this.state[`bracket${index}`]
      };

      fetch(`/api/home/${bracketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(newBracketName)
      })
        .then(res => res.json())
        .then(result => {
          this.setState({
            inputIndex: ''
          });
          if (!user) {
            return null;
          } else {
            updateBrackets(user.userId);
          }
        })
        .catch(error => {
          console.error('error:', error);
        });
    }
  }

  editBracketName(index, bracketId) {
    this.setState({
      inputIndex: index,
      editingBracketName: true
    });
  }

  renderUserBrackets() {
    const { myBrackets } = this.context;

    const mapList = myBrackets.map((data, index) => {
      return (
        (this.state.inputIndex !== index)
          ? <div className='d-flex justify-content-center' key={data.bracketId}>
            <div className='edit-bracket-wrapper my-1 mx-auto d-flex justify-content-start align-items-center position-relative'>
              <i className='bi bi-pencil-fill editing-icon' onClick={() => this.editBracketName(index)} />
              <a href={`#groups?group=a&bracketId=${data.bracketId}&bracketName=${data.bracketName}`}>
                <h1 className='bracket-name'>{data.bracketName}</h1>
              </a>
              <div className='position-absolute end-0'>
                <i className='bi bi-dash-circle editing-delete-icon' onClick={() => this.setState({ confirmDelete: true, bracketName: data.bracketName, bracketId: data.bracketId })} />
              </div>
            </div>
          </div>
          : <form onSubmit={this.handleSubmit} key={data.bracketId} >
            <div className='d-flex justify-content-center'>
              <div className='edit-bracket-wrapper my-1 mx-auto d-flex justify-content-start align-items-center position-relative'>
                <i className='bi bi-check-circle-fill editing-icon' onClick={() => this.handleSubmit(index, data.bracketId)}/>
                <input type='text' className='bracket-name' id={data.bracketId} name={`bracket${index}`} value={this.state[`brackets${index}`]} placeholder={data.bracketName} onChange={this.handleBracketNameChange} />
                <div className='position-absolute end-0'>
                  <i className='bi bi-dash-circle editing-delete-icon' onClick={() => this.setState({ confirmDelete: true, bracketName: data.bracketName, bracketId: data.bracketId })} />
                </div>
              </div>
            </div>
          </form>
      );
    });
    return (
      <div className='mx-2 text-center'>{mapList}</div>
    );
  }

  render() {
    const { user } = this.context;

    if (!user) {
      return (
        <div className='d-flex justify-content-center my-5 px-4'>
          <div className='d-flex flex-column justify-content-center'>
            <h1 className='my-4 py-4 text-center'>Log in to cast your predictions</h1>
            <button className='btn btn-primary mb-3 px-4 py-2' onClick={() => { window.location.hash = 'sign-in'; }}>Login</button>
          </div>
        </div>
      );
    }
    return (
      <>
        <div className='text-center my-5'>
          <h2>My Brackets</h2>
        </div>
        <div>
          {this.renderUserBrackets()}
        </div>
        {(!this.state.confirmDelete)
          ? null
          : <this.confirmDeleteAlert />
        }
      </>
    );

  }
}
Home.contextType = AppContext;
