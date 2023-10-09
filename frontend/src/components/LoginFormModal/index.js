import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
          console.log(errors.credential);
        }
      });
  };

  const handleLogInDemo = (e) => {
    e.preventDefault();
    const demoCred = "ggnore";
    const demoPassword = "password";
    return dispatch(
      sessionActions.login({ credential: demoCred, password: demoPassword })
    )
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  // disable login if username is less than 4 char and password is less than 6 char
  const disableLogIn = credential.length < 4 || password.length < 6;

  return (
    // login
    <>
      <h1>Log In</h1>
      <label>Username or Email</label>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            placeholder="Username or Email"
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && <p>{errors.credential}</p>}
        <button type="submit" disabled={disableLogIn}>
          Log In
        </button>
      </form>
      <button onClick={handleLogInDemo}>Log in as Demo User</button>
    </>
  );
}

export default LoginFormModal;
