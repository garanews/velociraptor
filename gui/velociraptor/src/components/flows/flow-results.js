import React from 'react';
import PropTypes from 'prop-types';

import api from '../core/api-service.js';
import VeloTable, { PrepareData } from '../core/table.js';
import _ from 'lodash';

import FormControl from 'react-bootstrap/FormControl';

const MAX_ROWS_PER_TABLE = 500;

export default class FlowResults extends React.Component {
    static propTypes = {
        flow: PropTypes.object,
    };

    componentDidMount = () => {
        this.fetchRows();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let prev_flow_id = prevProps.flow && prevProps.flow.session_id;
        let flow_id = this.props.flow && this.props.flow.session_id;
        if (flow_id != prev_flow_id ||
            prevState.selectedArtifact != this.state.selectedArtifact) {
            this.fetchRows();
        }
    }

    state = {
        selectedArtifact: "",
        loading: true,
        pageData: {},
    }

    fetchRows = () => {
        let client_id = this.props.flow && this.props.flow.client_id;
        let flow_id = this.props.flow && this.props.flow.session_id;
        let artifacts_with_results = this.props.flow && this.props.flow.artifacts_with_results;
        if (!client_id || !artifacts_with_results || !flow_id) {
            return;
        }
        let selectedArtifact = this.state.selectedArtifact;

        if (!selectedArtifact) {
            this.setState({selectedArtifact: artifacts_with_results[0]});
            selectedArtifact = artifacts_with_results[0];
        }

        let params = {
            client_id: client_id,
            flow_id: this.props.flow.session_id,
            artifact: selectedArtifact,
            start_row: 0,
            rows: MAX_ROWS_PER_TABLE,
        };

        this.setState({loading: true});
        api.get("api/v1/GetTable", params).then((response) => {
            this.setState({loading: false, pageData: PrepareData(response.data)});
        }).catch(() => {
            this.setState({loading: false, pageData: {}});
        });
    }

    render() {
        let body = <div>No data available</div>;
        let artifacts_with_results = this.props.flow.artifacts_with_results;

        if (this.state.pageData && this.state.pageData.columns) {
            body = <VeloTable
                         className="col-12"
                         rows={this.state.pageData.rows}
                         columns={this.state.pageData.columns} />;
        }

        return (
            <>
              <FormControl as="select" size="sm"
                           ref={ (el) => this.element=el }
                           onChange={() => {this.setState({
                               selectedArtifact: this.element.value,
                           });}}>
                {_.map(artifacts_with_results, function(item) {
                    return <option> {item} </option>;
                })}
              </FormControl>

                  { body }
            </>
        );
    }
};
