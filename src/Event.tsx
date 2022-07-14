import { ClientMode } from "./Constant";
import { hasEnable, saveCurrentFocus, scrollCenterInput } from "./GlobalFunction";
import { validation } from "./stores/ValidationStore";

export const handleInputFocus = (e, props) => {
    if (props.config.clientMode == ClientMode.PAPI) {
        const elem = e.target
        saveCurrentFocus()
        scrollCenterInput(elem)
    }
}

export const handleInputKeyDown = (e, props) => {
    handleTabPress(e, props)
    handleEnterPress(e, props)
}

export const handleTabPress = (e, props) => {
    if (e.keyCode == 9) {
        if (props.config.clientMode == ClientMode.PAPI && hasEnable(props.component.dataKey) && validation.isValidating) {
            console.log("hasEnable")
            e.preventDefault()
            e.target.blur()
        }
    }
}

export const handleEnterPress = (e, props) => {
    if (e.keyCode == 13) {
        if (e.shiftKey) {
            e.stopPropagation()
            return;
        }
        e.preventDefault();

        const inputs =
            Array.prototype.slice.call(document.querySelectorAll("input,textarea,select"))
        const index =
            (inputs.indexOf(document.activeElement) + 1) % inputs.length
        const input = inputs[index]

        if (props.config.clientMode == ClientMode.PAPI && hasEnable(props.component.dataKey) && validation.isValidating) {
            return
        }

        input.focus()
        input.select()
    }
}