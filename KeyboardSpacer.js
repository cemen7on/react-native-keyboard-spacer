/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { Component, PropTypes } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native';

import Orientation from 'react-native-orientation';

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200
  }
};

export default class KeyboardSpacer extends Component {
  static propTypes = {
    topSpacing: PropTypes.number,
    onToggle: PropTypes.func,
    style: View.propTypes.style,
  };

  static defaultProps = {
    topSpacing: 0,
    onToggle: () => null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      keyboardSpace: 0,
      isKeyboardOpened: false
    };
    this._listeners = null;
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    this.isLandscape=Orientation.getInitialOrientation()=='LANDSCAPE';
  }

  componentDidMount() {
    const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    this._listeners = [
      Keyboard.addListener(updateListener, this.updateKeyboardSpace),
      Keyboard.addListener(resetListener, this.resetKeyboardSpace)
    ];

    Orientation.addOrientationListener(this._onOrientationChange);
  }

  componentWillUnmount() {
    this._listeners.forEach(listener => listener.remove());

    Orientation.removeOrientationListener(this._onOrientationChange);
  }

    _onOrientationChange=(orientation)=>{
        this.isLandscape=orientation=='LANDSCAPE';
    };

  updateKeyboardSpace(event) {
    if (!event.endCoordinates) {
      return;
    }

    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity,
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    let {width, height}=Dimensions.get('window');
    let {isLandscape}=this;

    if(isLandscape && width<height){
        height=width;
    }

    if(!isLandscape && height<width){
        height=width;
    }

    let screenHeight=height;

    // when external physical keyboard is connected
    // event.endCoordinates.height still equals virtual keyboard height
    // however only the keyboard toolbar is showing if there should be one
    const keyboardSpace = (screenHeight - event.endCoordinates.screenY) + this.props.topSpacing;
    this.setState({
      keyboardSpace,
      isKeyboardOpened: true
    }, this.props.onToggle(true, keyboardSpace));
  }

  resetKeyboardSpace(event) {
    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity,
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    this.setState({
      keyboardSpace: 0,
      isKeyboardOpened: false
    }, this.props.onToggle(false, 0));
  }

  render() {
    return (
      <View style={[styles.container, { height: this.state.keyboardSpace }, this.props.style]} />);
  }
}
