const getToken = (state) => (state.auth.user ? state.auth.user.token : null);

export default getToken;
