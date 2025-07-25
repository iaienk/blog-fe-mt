import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {clearUser} from "../reducers/user.slice.js";

const useLogout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const logout = () => {
        dispatch(clearUser());
        navigate('/');
    }

    return {
        logout
    }
}

export default useLogout;