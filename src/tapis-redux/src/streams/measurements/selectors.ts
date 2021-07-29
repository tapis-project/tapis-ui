import { Streams } from '@tapis/tapis-typescript';
import { VariableList } from 'tapis-ui/components/streams';
import { TapisState } from '../../store/rootReducer';
import { MeasurementList, VariableMeasurmentListing } from "./types";

type getListingSelectorType = (state: TapisState) => MeasurementList;
type getVariableListingSelectorType = (state: TapisState) => VariableMeasurmentListing;

export const getMeasurements = (instrumentId: string): getListingSelectorType => {
    return (state: TapisState): MeasurementList => {
        return state.measurements.measurementMap[instrumentId];
    };
};

export const getVariableMeasurements = (instrumentId: string, variableId: string): getVariableListingSelectorType => {
    return (state: TapisState): VariableMeasurmentListing => {
        //temporarily cast to any since typing is incorrect
        let measurments: any[] = state.measurements.measurementMap[instrumentId].results;
        let list: VariableMeasurmentListing = measurments.reduce((acc: VariableMeasurmentListing, measurement: any) => {
            //the spec for Measurements is still wrong, so just guessing, assume "site" should be "variable"
            //any reason not to just put datetime map in separate object
            let variable: Streams.Variable = measurement.variable;
            let aux_props = ["measurements_in_file", "variable", "instrument"];
            if(variable.var_id == variableId) {
                for(let prop in measurement) {
                    //everything else should be datetimes
                    if(!aux_props.includes(prop)) {
                        list[prop] = measurement[prop];
                    }
                }
            }
        }, {});
        return list;
    };
};

