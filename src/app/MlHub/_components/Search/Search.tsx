import React from "react";
import { Button, Form, Container } from "reactstrap";
import { Navbar } from "@tapis/tapisui-common";
import { Models } from "app/MlHub/Models";
import { Link, useRouteMatch } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
import styles from '../../Models/Models.module.scss';
import {Icon} from "@tapis/tapisui-common";
import { useListByDataset, useListByLanguage, useListByAuthor, useListByLibrary, useListByQuery, useListByTask } from "@tapis/tapisui-hooks/dist/ml-hub/models";
import { autocompleteClasses, useAutocomplete } from "@mui/material";
import {styled } from "@mui/system";

const SearchBar: React.FC = () => {
    const { data, isLoading, error } = Hooks.Models.useList();
    const models: ModelsModule.ModelShortInfo = data?.result ?? {};
    const { path } = useRouteMatch();
    const Label = styled('label')({
        display: 'block',
    });
    // const Input = styled('input')(({ theme }) => ({
    //     width: 200,
    //     backgroundColor: '#fff',
    //     color: '#000',
    //     ...theme.applyStyles('dark', {
    //       backgroundColor: '#000',
    //       color: '#fff',
    //     }),
    //   }));
    //   const Listbox = styled('ul')(({ theme }) => ({
    //     width: 200,
    //     margin: 0,
    //     padding: 0,
    //     zIndex: 1,
    //     position: 'absolute',
    //     listStyle: 'none',
    //     backgroundColor: '#fff',
    //     overflow: 'auto',
    //     maxHeight: 200,
    //     border: '1px solid rgba(0,0,0,.25)',
    //     '& li.Mui-focused': {
    //       backgroundColor: '#4a8df6',
    //       color: 'white',
    //       cursor: 'pointer',
    //     },
    //     '& li:active': {
    //       backgroundColor: '#2977f5',
    //       color: 'white',
    //     },
    //     ...theme.applyStyles('dark', {
    //       backgroundColor: '#000',
    //     }),
    //   }));

    //   export default function UseAutocomplete() {
    //     const {
    //       getRootProps,
    //       getInputLabelProps,
    //       getInputProps,
    //       getListboxProps,
    //       getOptionProps,
    //       groupedOptions,
    //     } = useAutocomplete({
    //       id: 'autocomplete',
    //       options: models,
    //     //   getOptionLabel: (option) => option.title,
    //     });
    
    return(
        <Container>
            <Navbar>
                <Form>
                    Filter By: 
                    <label>
                        <select name="options"> 
                            <option value="Author"
                            onClick={()=>useListByAuthor({authorId: "Author"})}> Author </option>
                            <option value="Language"
                            onClick={()=>useListByLanguage({languageName: "Language"})}> Language </option>
                            <option value="Library"
                            onClick={()=>useListByLibrary({libraryName: "Library"})}> Library </option>
                            <option value="Task"
                            onClick={()=>useListByTask({taskType: "Task"})}> Task </option>
                            <option value="Trained Dataset"
                            onClick={()=>useListByDataset({dataset: "Dataset"})}> Trained Dataset </option>
                            <option value="Query"
                            onClick={()=>useListByQuery({query: "Query"})}> Query </option>
                        </select>
                    </label>
                    <label>
                        <input name="Enter Keyword"
                        autoComplete="yes"/>
                    </label>
                    <Button variant="outline-success">
                        Search
                    </Button>
                </Form>
            </Navbar>
            {/* <div>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>useAutocomplete</Label>
        <Input {...getInputProps()} />
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as typeof top100Films).map((option, index) => {
            const { key, ...optionProps } = getOptionProps({ option, index });
            return (
              <li key={key} {...optionProps}>
                {option.title}
              </li>
            );
          })}
        </Listbox>
      ) : null}
    </div> */}
        </Container>
        
    )
}

const SearchResults: React.FC = ({}) => {
    const { data, isLoading, error } = Hooks.Models.useList();
    const models: ModelsModule.ModelShortInfo = data?.result ?? {};
    const { path } = useRouteMatch();



    return (
        <QueryWrapper
          isLoading={isLoading}
          error={error}
          className={styles['models-table']}
        >

        

        </QueryWrapper>
      );
    };



export default SearchBar;