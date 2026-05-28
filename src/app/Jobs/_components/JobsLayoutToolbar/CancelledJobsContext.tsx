import App from 'app/_Layout';
import React, { createContext, useContext, useState } from 'react';

const myContext = createContext('job status');

export default myContext;
