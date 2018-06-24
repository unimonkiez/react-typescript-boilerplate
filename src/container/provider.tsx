import { Component } from 'react';
import PropTypes from 'prop-types';

interface ProviderProps {
  children?: any
}

export default class Provider extends Component<ProviderProps> {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  render() {
    const { children } = this.props;
    return children;
  }
}
