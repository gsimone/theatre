WorkspaceButtonsView = require './mainBoxView/WorkspaceButtonsView'
WorkspaceListView = require './mainBoxView/WorkspaceListView'
TimelineEditorView = require './mainBoxView/TimelineEditorView'
SeekbarView = require './mainBoxView/SeekbarView'
_Emitter = require '../_Emitter'
Foxie = require 'foxie'

module.exports = class MainBoxView extends _Emitter

	constructor: (@editor) ->

		super

		@rootView = @editor

		@model = @editor.model.mainBox

		do @_prepareNode

		do @_recalculateSpace

		window.addEventListener 'resize', => do @_recalculateSpace

		@timelineEditor = new TimelineEditorView @

		@seekbar = new SeekbarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

		do @_updateVertically

		@_visible = yes

		@model.on 'height-change', => do @_updateVertically

	_prepareNode: ->

		@node = Foxie('.timeflow-mainBox').putIn(@editor.node).trans(500)

		@nodeResizeHandle = Foxie('.timeflow-mainBox-resizeHandle')
		.putIn(@node)

		@rootView.moosh.onDrag(@nodeResizeHandle)
		.onDrag (e) =>

			@model.setHeight @model.height - e.relY

		@model.on 'visibility-toggle', =>

			do @_updateVisibility

			return

	_updateVertically: ->

		@node.css('height', @model.height + 'px')

		do @_updateVisibility

		return

	_recalculateSpace: ->

		newWidth = window.innerWidth - 8

		return if newWidth is @width

		@width = newWidth

		@_emit 'width-change'

	getCurrentHeight: ->

		@model.height - (if @model.isVisible() then 0 else @model.height - 21)

	_updateVisibility: ->

		return if @_visible is @model.isVisible()

		@_visible = @model.isVisible()

		if @_visible

			@node.moveYTo(0).setOpacity(1)

		else

			@node.moveYTo(@model.height - 21).setOpacity(0.8)

		return