// @flow
import React from 'react'
import css from './TimeBar.css'
import DraggableArea from '$studio/common/components/DraggableArea'
import cx from 'classnames'
import { BoxAtom } from '$src/shared/DataVerse/atoms/box';
import { noop } from 'lodash';

type Props = {
  shouldIgnoreMouse: boolean
  duration: number
  currentTime: number
  focus: [number, number]
  panelWidth: number
  changeCurrentTimeTo: Function
  changeFocusTo: Function
  changeFocusRightTo: Function
  changeFocusLeftTo: Function
  changeDuration: Function
  timeToX: Function
  xToTime: Function
  focusedTimeToX: Function
  xToFocusedTime: Function
  timeBox?: BoxAtom<number>
}

type State = {
  timeBeforeMove: number
  focusBeforeMove: [number, number]
  isChangingDuration: boolean
  currentTime: number
}

class TimeBar extends React.PureComponent<Props, State> {
  untapFromTimeBoxChanges: () => void
  constructor(props: Props) {
    super(props)

    this.state = {
      currentTime: 0,
      timeBeforeMove: props.currentTime,
      focusBeforeMove: props.focus,
      isChangingDuration: false,
    }

    this.untapFromTimeBoxChanges = noop
  }

  componentWillMount() {
    this.check()
  }

  componentWillReceiveProps(newProps: Props) {
    this.check(newProps)
  }

  check(props: Props = this.props) {
    this.untapFromTimeBoxChanges()

    if (props.timeBox) {
      this.untapFromTimeBoxChanges =  props.timeBox.changes().tap(this._updateFromTimeBox)
    }
  }

  _updateFromTimeBox = (currentTime: number) => {
    this.setState({currentTime})
  }

  changeCurrentTime(dx: number) {
    const {focus, xToFocusedTime, focusedTimeToX} = this.props
    const {timeBeforeMove} = this.state
    const currentTimeX = focusedTimeToX(timeBeforeMove, focus)
    this.props.changeCurrentTimeTo(xToFocusedTime(currentTimeX + dx, focus))
  }

  moveFocus(dx: number) {
    const {focusBeforeMove} = this.state
    const dt = this.props.xToTime(dx)
    this.props.changeFocusTo(focusBeforeMove[0] + dt, focusBeforeMove[1] + dt)
  }

  moveFocusRight(dx: number) {
    const {xToTime, changeFocusRightTo} = this.props
    const {focusBeforeMove} = this.state
    changeFocusRightTo(focusBeforeMove[1] + xToTime(dx))
  }

  moveFocusLeft(dx: number) {
    const {xToTime, changeFocusLeftTo} = this.props
    const {focusBeforeMove} = this.state
    changeFocusLeftTo(focusBeforeMove[0] + xToTime(dx))
  }

  _setBeforeMoveState = () => {
    // const {currentTime, focus} = this.props
    const {focus} = this.props
    const {currentTime} = this.state

    this.setState(() => ({
      timeBeforeMove: currentTime,
      focusBeforeMove: focus,
    }))
  }

  enableChangingDuration = () => {
    this.setState(() => ({isChangingDuration: true}))
  }

  disableChangingDuration = () => {
    this.setState(() => ({isChangingDuration: false}))
  }

  changeDuration = (newDuration: string) => {
    this.props.changeDuration(Number(newDuration) * 1000)
    this.disableChangingDuration()
  }

  _addGlobalCursorRule(cursor: string) {
    document.styleSheets[0].insertRule(
      `* {cursor: ${cursor} !important;}`,
      document.styleSheets[0].cssRules.length,
    )
    document.styleSheets[0].insertRule(
      'div[class^="AnimationTimelinePanel_container_"] {pointer-events: none;}',
      document.styleSheets[0].cssRules.length,
    )
    document.styleSheets[0].insertRule(
      'div[class*="AnimationTimelinePanel_panelContainer_"] {z-index: 200;}',
      document.styleSheets[0].cssRules.length,
    )
  }

  _removeGlobalCursorRule() {
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
  }

  render() {
    const {isChangingDuration} = this.state
    let {
      focus,
      duration,
      timeToX,
      focusedTimeToX,
      panelWidth,
      shouldIgnoreMouse,
    } = this.props
    let {currentTime} = this.state
    const focusLeft = timeToX(focus[0])
    const focusRight = timeToX(focus[1])
    const currentX = focusedTimeToX(currentTime, focus)
    currentTime = currentTime / 1000
    focus = focus.map(f => f / 1000)
    duration = duration / 1000
    
    const isSeekerHidden = (currentX < 0 || currentX > panelWidth)
    return (
      <div className={cx(
        css.container, {[css.shouldIgnoreMouse]: shouldIgnoreMouse})}>
        {/* <div className={css.timeStart}>{0}</div>
        {isChangingDuration ? (
          <SingleInputForm
            className={css.timeEndInput}
            value={String(duration)}
            onSubmit={this.changeDuration}
            onCancel={this.disableChangingDuration}
          />
        ) : (
          <div
            className={css.timeEnd}
            title="Double click to change"
            onDoubleClick={this.enableChangingDuration}
          >
            {duration.toFixed(0)}
          </div>
        )} */}
        <div className={css.timeThread}>
          <DraggableArea
            onDragStart={() => {
              this._addGlobalCursorRule('ew-resize')
              this._setBeforeMoveState()
            }}
            onDrag={dx => this.moveFocus(dx)}
            onDragEnd={this._removeGlobalCursorRule}            
          >
            <div
              className={css.focusBar}
              style={{
                width: `${focusRight - focusLeft + 6}px`,
                transform: `translateX(${focusLeft}px)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            onDragStart={() => {
              this._addGlobalCursorRule('w-resize')
              this._setBeforeMoveState()
            }}
            onDrag={dx => this.moveFocusLeft(dx)}
            onDragEnd={this._removeGlobalCursorRule}            
          >
            <div
              className={css.leftFocusHandle}
              style={{transform: `translateX(${focusLeft}px)`}}
            >
              <div className={css.focusTimeToolTip}>{focus[0].toFixed(1)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDragStart={() => {
              this._addGlobalCursorRule('e-resize')
              this._setBeforeMoveState()
            }}
            onDrag={dx => this.moveFocusRight(dx)}
            onDragEnd={this._removeGlobalCursorRule}          
          >
            <div
              className={css.rightFocusHandle}
              style={{transform: `translateX(${focusRight}px)`}}
            >
              <div className={css.focusTimeToolTip}>{focus[1].toFixed(1)}</div>
            </div>
          </DraggableArea>
        </div>
        <DraggableArea
          onDragStart={() => {
            this._addGlobalCursorRule('ew-resize')
            this._setBeforeMoveState()
          }}
          onDrag={dx => this.changeCurrentTime(dx)}
          onDragEnd={this._removeGlobalCursorRule}
        >
          <div
            className={cx(css.currentTimeNeedle, {[css.isHidden]: isSeekerHidden})}
            style={{transform: `translateX(${currentX}px)`}}
          />
        </DraggableArea>
        <DraggableArea
          onDragStart={() => {
            this._addGlobalCursorRule('ew-resize')
            this._setBeforeMoveState()
          }}
          onDrag={dx => this.changeCurrentTime(dx)}
          onDragEnd={this._removeGlobalCursorRule}          
        >
          <div
            className={cx(css.currentTimeThumb, {[css.isHidden]: isSeekerHidden})}
            style={{transform: `translateX(${currentX}px)`}}
          >
            <div className={css.thumbSquinch} />
            <div className={css.currentTimeToolTip}>{currentTime.toFixed(1)}</div>
          </div>
        </DraggableArea>
      </div>
    )
  }
}

export default TimeBar