var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useContext, useCallback, useEffect } from 'react';
import StepWizard from 'react-step-wizard';
import { Button } from 'reactstrap';
import { Formik, Form, useFormikContext } from 'formik';
import styles from './Wizard.module.scss';
var WizardContext = React.createContext({});
export var useWizard = function () {
    var props = useContext(WizardContext);
    return props;
};
export var WizardNavigation = function () {
    var _a = useWizard(), currentStep = _a.currentStep, previousStep = _a.previousStep, totalSteps = _a.totalSteps, nextStep = _a.nextStep, goToStep = _a.goToStep;
    var _b = useFormikContext(), validateForm = _b.validateForm, handleSubmit = _b.handleSubmit;
    var onContinue = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, validateForm()];
                case 1:
                    errors = _b.sent();
                    if (!Object.keys(errors).length) {
                        handleSubmit && handleSubmit();
                        nextStep && nextStep();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [validateForm, nextStep, handleSubmit]);
    var onSkip = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var errors, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, validateForm()];
                case 1:
                    errors = _b.sent();
                    if (!Object.keys(errors).length && goToStep && !!totalSteps) {
                        // Skip to End button doesn't appear to trigger handleSubmit,
                        // so it must be called explicitly
                        handleSubmit();
                        goToStep(totalSteps);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [validateForm, handleSubmit, goToStep, totalSteps]);
    return (_jsxs("div", __assign({ className: styles.controls }, { children: [!!currentStep && currentStep > 1 && (_jsx(Button, __assign({ onClick: previousStep }, { children: "Back" }))), !!currentStep && !!totalSteps && currentStep < totalSteps && (_jsxs(_Fragment, { children: [_jsx(Button, __assign({ type: "submit", color: "primary", onClick: onContinue }, { children: "Continue" })), _jsx(Button, __assign({ type: "submit", color: "secondary", onClick: onSkip }, { children: "Skip to End" }))] }))] })));
};
function WizardSummary(_a) {
    var steps = _a.steps, stepWizardProps = __rest(_a, ["steps"]);
    var goToNamedStep = stepWizardProps.goToNamedStep;
    var editCallback = useCallback(function (stepId) { return goToNamedStep && goToNamedStep(stepId); }, [goToNamedStep]);
    return (_jsxs("div", __assign({ className: styles.summary }, { children: [_jsx("h3", { children: "Summary" }), steps.map(function (step) { return (_jsxs("div", __assign({ className: styles['step-summary'] }, { children: [_jsxs("div", __assign({ className: styles.name }, { children: [_jsx("b", { children: step.name }), _jsx(Button, __assign({ color: "link", onClick: function () { return editCallback(step.id); }, className: styles.edit }, { children: "edit" }))] })), _jsx("div", __assign({ className: styles.content }, { children: step.summary }))] }), "wizard-summary-".concat(step.id))); })] })));
}
function StepContainer(_a) {
    var step = _a.step, formSubmit = _a.formSubmit;
    var validationSchema = step.validationSchema, initialValues = step.initialValues, validate = step.validate;
    return (_jsx(Formik, __assign({ validationSchema: validationSchema, initialValues: initialValues, validate: validate, onSubmit: formSubmit, enableReinitialize: true }, { children: _jsx(Form, { children: _jsxs("div", __assign({ className: styles.step }, { children: [step.render, _jsx(WizardNavigation, {})] })) }) })));
}
function Wizard(_a) {
    var steps = _a.steps, memo = _a.memo, formSubmit = _a.formSubmit;
    var _b = useState({}), stepWizardProps = _b[0], setStepWizardProps = _b[1];
    var instanceCallback = useCallback(function (props) {
        setStepWizardProps(__assign({ currentStep: 1, totalSteps: steps.length }, props));
    }, [setStepWizardProps, steps]);
    var stepChangeCallback = useCallback(function (_a) {
        var activeStep = _a.activeStep;
        setStepWizardProps(__assign(__assign({}, stepWizardProps), { currentStep: activeStep }));
    }, [setStepWizardProps, stepWizardProps]);
    var goToStep = stepWizardProps.goToStep;
    useEffect(function () {
        goToStep && goToStep(1);
    }, 
    /* eslint-disable-next-line */
    [memo]);
    return (_jsx(WizardContext.Provider, __assign({ value: stepWizardProps }, { children: _jsxs("div", __assign({ className: styles.container }, { children: [_jsx(StepWizard, __assign({ instance: instanceCallback, className: styles.steps, onStepChange: stepChangeCallback, transitions: {} }, { children: steps.map(function (step) { return (_jsx(StepContainer, { step: step, stepName: step.id, formSubmit: formSubmit }, "wizard-step-".concat(step.id))); }) })), _jsx(WizardSummary, __assign({ steps: steps }, stepWizardProps))] })) })));
}
export default Wizard;
