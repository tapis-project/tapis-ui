import React, { useState } from "react"
import { Workflows } from "@tapis/tapis-typescript";
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import styles from "./Builder.module.scss";
import { Field } from "formik"

const Builder: React.FC<{index: number}> = ({index}) => {
    const [ type, setType ] = useState<string>("")
    return (
      <div className={styles["grid-2"]}>
        <FormikSelect
          name={`tasks.${index}.builder`}
          label={"image builder"}
          required={true}
          description={'Select "kaniko" for Docker images and "singularity" for Singularity images'}
          onChange={(e) => {setType(e.target.value)}}
        >
          <option disabled selected={!type} value={""}>-- select an option --</option>
          {Object.values(Workflows.EnumBuilder).map((builder) => {
            return <option value={builder} selected={type === builder}>{builder}</option>
          })}
        </FormikSelect>
        <label>
          <Field
            type="checkbox"
            name={`tasks.${index}.cache`}
            disabled={type === Workflows.EnumBuilder.Singularity}
          /> enable layer caching
        </label>
      </div>
    )
}

export default Builder