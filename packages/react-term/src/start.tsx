import ReactDOM from 'react-dom';
import React, { Component } from 'react';

import css from './index.scss';

import ReactTerm, { ValueType } from './ReactTerm';

interface IAppState {
  title: string;
  label: string;
  delimiter?: string;
  lines: ValueType[];
  value: ValueType | { value: ValueType; secret?: boolean };
}

class App extends Component<any, IAppState> {
  public state: IAppState = {
    title: '',
    label: '',
    lines: ['First string'],
    value: { secret: true, value: [{ str: 'Password: ', lock: true }] },
  };

  private updateTimeout?: ReturnType<typeof setTimeout>;

  public componentDidMount() {
    this.updateState();
  }

  public componentWillUnmount() {
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
  }

  public render() {
    const { title, label, delimiter, lines, value } = this.state;
    return (
      <ReactTerm
        label={label}
        title={title}
        delimiter={delimiter}
        initialLines={lines}
        initialValue={value}
        className={css.term}
      />
    );
  }

  private updateState() {
    this.updateTimeout = setTimeout(() => this.setState({
      title: 'react-term',
      label: 'guest',
      delimiter: '-',
    }), 1000);
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
