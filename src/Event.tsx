import { ClientMode } from "./Constant";
import { hasEnable, saveCurrentFocus, scrollCenterInput } from "./GlobalFunction";

export const handleInputFocus = (e, props) => {
    const elem = e.target
    saveCurrentFocus()
    scrollCenterInput(elem)
    console.log("props", props)
}

export const handleInputKeyDown = (e, props) => {
    const elem = e.target
    handleTabPress(e, props)
}

export const handleTabPress = (e, props) => {
    "use strict";
    if (e.keyCode == 9) {
        if (props.config.clientMode == ClientMode.PAPI && hasEnable(props.component.dataKey)) {
            e.preventDefault()   
            e.target.blur()
        }   
    }
}