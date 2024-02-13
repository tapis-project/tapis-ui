# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).



## Cgarcia Notes
Fixtures mainly used for test inputs



```
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.RespBasic, Error, DeletePodHookParams>(
      [QueryKeys.deletePod, basePath, jwt],
      ({ podId }) => deletePod(podId, basePath, jwt)
    );
```

>Could you explain what this is? It this typescript notation? It's a variable equal to a function with items in <> and inputs in () with the running function after => ?

Yes, you're correct! The code you provided is written in TypeScript, which is a statically typed superset of JavaScript. TypeScript allows you to add type annotations to your code, providing additional information about the types of variables, function parameters, and return values.

In the code you shared, we have a variable declaration using destructuring assignment. The variable is named mutate and it is being assigned the value returned by the useMutation hook. The useMutation hook is a custom hook provided by a library or framework, commonly used in React applications.

The useMutation hook takes three type parameters: Pods.RespBasic, Error, and DeletePodHookParams. These type parameters specify the expected types of the data, error, and parameters used by the hook.

The hook also takes two arguments. The first argument is an array [QueryKeys.deletePod, basePath, jwt], which likely represents dependencies that trigger the hook to re-run when they change. The second argument is a function that will be called when the hook is executed. This function takes an object with a property podId as its parameter and returns the result of calling the deletePod function with the podId, basePath, and jwt as arguments.

So, in summary, the code is using the useMutation hook to perform a mutation operation. It is destructuring the returned values into variables like mutate, isLoading, isError, etc. The hook is configured with type parameters and arguments, including a callback function that will be executed when the hook is triggered.