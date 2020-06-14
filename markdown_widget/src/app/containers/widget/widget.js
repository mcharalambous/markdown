import React, { Component } from 'react';
import * as ReactMarkdown from 'react-markdown';
import * as Styles from './styles.css';
import { mergeStyleSets } from 'office-ui-fabric-react';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import {
  DefaultButton
} from 'office-ui-fabric-react/lib/Button';
import {
  Field,
  FieldModes as FM,
  FieldTypes as FT,
} from '@toolsui/toolsui';
import {
  DialogFooter
} from 'office-ui-fabric-react/lib/Dialog';


const markdown = `
Please configure the markdown text through widget settings
`
export default class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: '',
      _height: 0,
      _showModal: false,
    };
    this._closeModal = this._closeModal.bind(this);
    this.renderFields = this.renderFields.bind(this);
  }

  componentDidMount() {
    this.setState({_height: this.divElement.parentNode.clientHeight})
  }

  componentDidUpdate(prevProps) {
    if (this.state._height && this.divElement && this.divElement.parentNode.clientHeight != this.state._height) {
      this.setState({_height: this.divElement.parentNode.clientHeight})
    }
  }

  _closeModal() {
    let settingsObj = {};
    for (let property in this.state) {
      if (!property.startsWith("_")) {
        settingsObj[property] =  this.state[property]
      }
    }
    this.props.closeWidgetSettings(this.props.id, settingsObj);
  }

  static getDerivedStateFromProps(props, current_state) {
    if (props.settings.markdown !== current_state.markdown && current_state.markdown != '' ){
      return {
        ...props.settings,
        markdown: current_state.markdown,
        _height: current_state.height,
        _showModal: props.showSettingsModal,
      }
    } else {
      return {
        _showModal: props.showSettingsModal,
        ...props.settings,
      }
    }
  }

  getFieldsOpts() {
    return [
      {
        key: 'markdown',
        type: FT.CODE,
        label: 'MarkDown',
        infoProps: {
          title: '',
          content: 'This field uses markdown syntax.'
        },
        meta: {
          height: '300px',
          width: '600px',
          options: {
            scrollBeyondLastLine: false
          }
        },
      },
    ];
  }

  renderFields(layout) {
    return layout.map((field, i) => {
      return <Field
        key={`${field.key}-${i}`}
        {...{
          mode: FM.EDITABLE,
          value: this.state.markdown,
          onChange: value => {
            this.setState({ [field.key]: value });
          },
          ...field
        }}
      />;
    });
  }

  renderPanelSettingsFooter() {
      return (
        <DefaultButton
          onClick={this._closeModal.bind(this)}
          text="Close"
        />
      )
  }

  renderSettingsDialog() {
    return (
      <Panel
        isOpen={this.state._showModal}
        // isBlocking={false}
        type={PanelType.medium}
        onDismiss={this._closeModal.bind(this)}
        headerText="Widget Settings"
        closeButtonAriaLabel="Close"
        onRenderFooterContent={this.renderPanelSettingsFooter.bind(this)}
        isFooterAtBottom={true}
        focusTrapZoneClassName={Styles.focusTrapZone}
        styles= {{
          root: {
            zIndex: 'unset'
          },
        }}
        overlayProps={{
          styles: { root: {
              zIndex: '4',
              backgroundColor: 'rgba(200, 200, 200, 0.8)'
            },}
        }}
        layerProps={{
          className: Styles.layerPositionUnset
        }}
      >
        <div>
          {this.renderFields(this.getFieldsOpts())}
        </div>
      </Panel>
    )
  }

  render() {
    const className = mergeStyleSets({
      wrapper: {
        height: this.state._height ? this.state._height-35 : '10vh',
        position: 'relative',
      },
    });

    return (
      <div className={className.wrapper}
           ref={(divelement) => {
             this.divElement = divelement
           }}
      >
        <ScrollablePane
          scrollbarVisibility={ScrollbarVisibility.auto}
        >
          <ReactMarkdown source={this.state.markdown != '' ? this.state.markdown : markdown } escapeHtml={false}/>
        </ScrollablePane>
        {this.renderSettingsDialog()}
      </div>
    )
  }
}
