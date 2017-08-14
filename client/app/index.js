import React from 'react';
import { render } from 'react-dom';
import moment from 'moment';
import './style.css';

class Log extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileLists: this.props.data.changeFileLists ? this.props.data.changeFileLists.slice(0, 3) : undefined,
      isShowAll: false
    };
    this.handleMore = this.handleMore.bind(this);
  }
  handleMore() {
    this.setState(prevState => ({
      fileLists: prevState.isShowAll ? this.props.data.changeFileLists.slice(0, 3) : this.props.data.changeFileLists,
      isShowAll: !prevState.isShowAll
    }))
  }
  render() {
    let { project, createAt, changeFileLists, error } = this.props.data;
    return (
      <tr>
        <td>{project.name}</td>
        <td>{project.branch}</td>
        <td>{project.commitAuthor}</td>
        <td>{moment(createAt).format('YYYY/MM/DD HH:mm')}</td>
        <td>{error && error.length > 0 ? <div className="error-red"></div> : <div className="success-green"></div>}</td>
        <td>
          {
            changeFileLists && changeFileLists.length > 0 ?
            (
              changeFileLists.length < 4 ?
              (<ul>
                {changeFileLists.map((file, index) => {
                  return <li key={index}>{file}</li>
                })}
              </ul>)
              : (<div><ul>
                  {this.state.fileLists.map((file, index) => {
                    return <li key={index}>{file}</li>
                  })}</ul>
                <button className="btn btn-default btn-sm" onClick={this.handleMore}>{this.state.isShowAll ? 'Less' : 'More'}</button>
                </div>)
            )
            : ''
          }
      </td>
        <td>
          {
            error && error.length > 0 ?
            (<button className="btn btn-default btn-sm" onClick={() => this.props.onClickError(this.props.index)}>Detail</button>) : ''
          }
        </td>
      </tr>
    )
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { logs: [] };
    this.handleError = this.handleError.bind(this);
    this.hideError = this.hideError.bind(this);
  }
  componentDidMount() {
    fetch('/auto_deploy/list')
    .then(response => response.json())
    .then(json => {
      this.setState({
        logs: json
      });
    });
  }
  handleError(index) {
    this.setState({
      errorIndex: index
    });
  }
  hideError() {
    this.setState({
      errorIndex: undefined
    });
  }
  render() {
    let error = this.state.logs[this.state.errorIndex] ? this.state.logs[this.state.errorIndex].error : undefined;
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>项目</th>
              <th>分支</th>
              <th>用户</th>
              <th>时间</th>
              <th>状态</th>
              <th>内容</th>
              <th>错误</th>
            </tr>
          </thead>
          <tbody>
            {this.state.logs.map((log, index) => {
              return <Log key={log.id} data={log} index={index} onClickError={this.handleError} />
            })}
          </tbody>
        </table>
        {
          error && error.length > 0 ?
          (
            <div className="pop-error-message" onClick={this.hideError}>
              <ul>
                {error.map((command, index) => {
                  return <li key={index}><p>{command[0]}</p>{typeof command[1] == 'string' ? <pre>{command[1]}</pre> : ''}</li>
                })}
              </ul>
            </div>
          ) : ''
        }
      </div>
    )
  }
}

render(
  <App />,
  document.getElementById('app')
);
