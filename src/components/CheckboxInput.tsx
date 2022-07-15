import { For, Switch, Match, createMemo, createSignal, Show } from "solid-js"
import { ClientMode } from "../Constant"
import { handleInputFocus, handleInputKeyDown } from "../Event"
import { FormComponentBase, Option } from "../FormType"
import { findSumCombination, sum, transformCheckboxOptions } from "../GlobalFunction"
import { reference, setReference } from '../stores/ReferenceStore'

const CheckboxInput: FormComponentBase = props => {
    const config = props.config
    const [disableInput] = createSignal((config.formMode > 1) ? true : props.component.disableInput)
    let handleOnChange = (value: any, label: any = null, open: any = null) => {
        let updatedAnswer
        if (label == null && open == null) {
            const checkboxOptions = transformCheckboxOptions(options())
            const optionValue = checkboxOptions.map(item => Number(item.checkboxValue))
            const sumCombination = findSumCombination(Number(value), optionValue)
            if (sumCombination.length > 0) {
                updatedAnswer = checkboxOptions.filter(option => sumCombination.includes(Number(option.value)))
            }
        } else {
            updatedAnswer = JSON.parse(JSON.stringify(props.value))
            if (updatedAnswer) {
                if (props.value.some(d => String(d.value) === String(value))) {
                    if (open) {
                        let valueIndex = options().findIndex((item) => item.value == value);
                        updatedAnswer = updatedAnswer.filter((item) => item.value != value)
                        if (options()[valueIndex].label !== label) updatedAnswer.push({ value: value, label: label, open: true })
                    } else {
                        updatedAnswer = updatedAnswer.filter((item) => item.value != value)
                    }
                } else {
                    updatedAnswer.splice(updatedAnswer.length, 0, { value: value, label: label })
                }
            } else {
                updatedAnswer = [];
                updatedAnswer.push({ value: value, label: label })
            }
        }
        props.onValueChange(updatedAnswer);
    }

    let handleLabelClick = (index: any) => {
        let id = "checkbox-" + props.component.dataKey + "-" + index
        document.getElementById(id).click()
    }

    let tick = (value: string): boolean => {
        return (props.value) ? (props.value.some(d => String(d.value) === String(value)) ? true : false) : false;
    }

    let optionLabel = (value: string) => {
        let optionIndex = props.value.findIndex(d => String(d.value) === String(value))
        return props.value[optionIndex].label
    }

    let getOptions = createMemo(() => {
        if (props.component.sourceOption !== undefined && props.component.typeOption === 3) {
            let newSourceOption = props.component.sourceOption.split('@');
            const componentAnswerIndex = reference.details.findIndex(obj => obj.dataKey === newSourceOption[0]);
            if ((reference.details[componentAnswerIndex].type === 21 || 22 || 23 || 26 || 27 || 29)
                || (reference.details[componentAnswerIndex].type === 4 && reference.details[componentAnswerIndex].renderType === 2)) {
                return reference.details[componentAnswerIndex].answer
            }
        }
        return []
    })

    const [options] = createSignal<Option[]>(props.component.sourceOption !== undefined ? getOptions() : props.component.options);

    const [instruction, setInstruction] = createSignal(false);
    const showInstruction = () => {
        (instruction()) ? setInstruction(false) : setInstruction(true);
    }

    const [enableRemark] = createSignal((props.component.enableRemark !== undefined ? props.component.enableRemark : true) && config.clientMode != ClientMode.PAPI);
    const [disableClickRemark] = createSignal((config.formMode > 2 && props.comments == 0) ? true : false);

    let settedValue = (props.value) ? props.value.length > 0 ? sum(props.value.map(it => it.value)) : props.value : props.value

    let classInput = 'w-full text-right rounded font-light px-4 py-2.5 text-sm text-gray-700 bg-white bg-clip-padding transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400';

    return (
        <div>
            <Show when={config.clientMode == ClientMode.PAPI}>
                <div class="grid md:grid-cols-8 border-b border-gray-300/[.40] dark:border-gray-200/[.10] p-2">
                    <div class="font-light text-sm space-y-2 py-2.5 px-2 md:col-span-7">
                        <div class="inline-flex space-x-2">
                            <div innerHTML={props.component.label} />
                            <Show when={props.component.required}>
                                <span class="text-pink-600">*</span>
                            </Show>
                            <Show when={props.component.hint}>
                                <button class="bg-transparent text-gray-300 rounded-full focus:outline-none h-4 w-4 hover:bg-gray-400 hover:text-white flex justify-center items-center"
                                    onClick={showInstruction}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </Show>
                        </div>
                        <div class="grid mt-2 space-y-6">
                            <Show when={instruction()}>
                                <div class="italic text-xs font-extralight text-zinc-400 " innerHTML={props.component.hint} />
                            </Show>

                            <div class="grid font-light text-sm content-start"
                                classList={{
                                    'grid-cols-1': props.component.cols === 1 || props.component.cols === undefined,
                                    'grid-cols-2': props.component.cols === 2,
                                    'grid-cols-3': props.component.cols === 3,
                                    'grid-cols-4': props.component.cols === 4,
                                    'grid-cols-5': props.component.cols === 5,
                                }}
                            >
                                <For each={options()}>
                                    {(item, index) => (
                                        <Switch>
                                            <Match when={(item.open) && (tick(item.value))}>
                                                <div class="font-light text-sm space-x-2 py-2.5 px-4 grid grid-cols-12">
                                                    <div class="col-span-1">
                                                        <label class="cursor-pointer text-sm" for={"chexbox" + index()}>
                                                            <input class="form-check-input appearance-none h-4 w-4 border 
                                                            border-gray-300 rounded-sm bg-white 
                                                            checked:bg-blue-600 checked:border-blue-600 
                                                            focus:outline-none transition duration-200 align-top 
                                                            bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer
                                                            checked:disabled:bg-gray-500 checked:dark:disabled:bg-gray-300 
                                                            disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                                                                type="checkbox"
                                                                disabled
                                                                onChange={e => handleOnChange(e.currentTarget.value, item.label, item.open)} value={item.value}
                                                                checked={(item.value) ? tick(item.value) : false} id={"checkbox-" + props.component.dataKey + "-" + index()} />
                                                        </label>
                                                    </div>
                                                    <div class="col-span-11">
                                                        <input type="text" value={optionLabel(item.value)}
                                                            class="w-full
                                                            font-light
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            text-gray-700
                                                            bg-white bg-clip-padding
                                                            border border-solid border-gray-300
                                                            rounded
                                                            transition
                                                            ease-in-out
                                                            m-0
                                                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                                            onChange={e => handleOnChange(item.value, e.currentTarget.value, item.open)}
                                                        />
                                                    </div>
                                                </div>
                                            </Match>
                                            <Match when={!(item.open) || !(tick(item.value))}>
                                                <div class="font-light text-sm space-x-2 py-2.5 px-4 grid grid-cols-12" onClick={e => handleLabelClick(index())}>
                                                    <div class="col-span-1">
                                                        <label class="cursor-pointer text-sm">
                                                            <input class="form-check-input appearance-none h-4 w-4 border 
                                                                border-gray-300 rounded-sm bg-white 
                                                                checked:bg-blue-600 checked:border-blue-600 
                                                                focus:outline-none transition duration-200 mt-1 align-top 
                                                                bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer
                                                                checked:disabled:bg-gray-500 checked:dark:disabled:bg-gray-300 
                                                                disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                                                                type="checkbox"
                                                                disabled
                                                                onChange={e => handleOnChange(e.currentTarget.value, item.label, item.open)} value={item.value}
                                                                checked={(item.value) ? tick(item.value) : false} id={"checkbox-" + props.component.dataKey + "-" + index()} />
                                                        </label>
                                                    </div>
                                                    <div class="col-span-11" innerHTML={item.label}></div>
                                                </div>
                                            </Match>
                                        </Switch>
                                    )}
                                </For>
                            </div>
                        </div>
                    </div>
                    <div class="font-light text-sm space-x-2 py-2.5 px-2 md:col-span-1 grid grid-cols-12">
                        <div class=""
                            classList={{
                                'col-span-11 lg:-mr-4': enableRemark(),
                                'col-span-12': !(enableRemark()),
                            }}  >
                            <Show when={props.component.lengthInput === undefined}>
                                <input value={settedValue} type="text"
                                    name={props.component.dataKey}
                                    class={classInput}
                                    classList={{
                                        ' border border-solid border-gray-300 ': props.classValidation === 0,
                                        ' border-orange-500 dark:bg-orange-100 ': props.classValidation === 1,
                                        ' border-pink-600 dark:bg-pink-100 ': props.classValidation === 2,
                                    }}
                                    placeholder=""
                                    disabled={disableInput()}
                                    onChange={(e) => {
                                        handleOnChange(e.currentTarget.value);
                                    }}
                                    onFocus={(e) => handleInputFocus(e, props)}
                                    onKeyDown={(e) => handleInputKeyDown(e, props)}
                                />
                            </Show>
                            <Show when={props.component.lengthInput !== undefined && props.component.lengthInput.length > 0}>
                                <input value={settedValue} type="text"
                                    name={props.component.dataKey}
                                    class={classInput}
                                    classList={{
                                        ' border border-solid border-gray-300 ': props.classValidation === 0,
                                        ' border-orange-500 dark:bg-orange-100 ': props.classValidation === 1,
                                        ' border-pink-600 dark:bg-pink-100 ': props.classValidation === 2,
                                    }}
                                    placeholder=""
                                    disabled={disableInput()}
                                    onChange={(e) => {
                                        props.onValueChange(e.currentTarget.value);
                                    }}
                                    onFocus={(e) => handleInputFocus(e, props)}
                                    onKeyDown={(e) => handleInputKeyDown(e, props)}
                                    maxlength={props.component.lengthInput[0].maxlength !== undefined ? props.component.lengthInput[0].maxlength : ''}
                                    minlength={props.component.lengthInput[0].minlength !== undefined ? props.component.lengthInput[0].minlength : ''}
                                />
                            </Show>
                        </div>
                        <Show when={enableRemark()}>
                            <div class=" flex justify-end ">
                                <button class="relative inline-block bg-white p-2 h-10 w-10 text-gray-500 rounded-full  hover:bg-yellow-100 hover:text-yellow-400 hover:border-yellow-100 border-2 border-gray-300 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                                    disabled={disableClickRemark()}
                                    onClick={e => props.openRemark(props.component.dataKey)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <span class="absolute top-0 right-0 inline-flex items-center justify-center h-6 w-6
                                    text-xs font-semibold text-white transform translate-x-1/2 -translate-y-1/4 bg-pink-600/80 rounded-full"
                                        classList={{
                                            'hidden': props.comments === 0
                                        }}>
                                        {props.comments}
                                    </span>
                                </button>
                            </div>
                        </Show>
                    </div>

                    <div class="col-span-12"
                        classList={{
                            ' border-b border-orange-500 pb-3 ': props.classValidation === 1,
                            ' border-b border-pink-600 pb-3 ': props.classValidation === 2,
                        }}>
                    </div>
                    <div class="col-span-12 pb-4">
                        <Show when={props.validationMessage.length > 0}>
                            <For each={props.validationMessage}>
                                {(item: any) => (
                                    <div
                                        class="text-xs font-light mt-1">
                                        <div class="grid grid-cols-12"
                                            classList={{
                                                ' text-orange-500 dark:text-orange-200 ': props.classValidation === 1,
                                                ' text-pink-600 dark:text-pink-200 ': props.classValidation === 2,
                                            }} >
                                            <Switch>
                                                <Match when={props.classValidation === 1}>
                                                    <div class="col-span-1 flex justify-center items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                </Match>
                                                <Match when={props.classValidation === 2}>
                                                    <div class="col-span-1 flex justify-center items-start">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                </Match>
                                            </Switch>
                                            <div class="col-span-11 text-justify mr-1" innerHTML={item} />
                                        </div>
                                    </div>
                                )}
                            </For>
                        </Show>
                    </div>
                </div>
            </Show>
            <Show when={config.clientMode != ClientMode.PAPI}>
                <div class="grid md:grid-cols-3 border-b border-gray-300/[.50] dark:border-gray-200/[.10] p-2">
                    <div class="font-light text-sm space-y-2 py-2.5 px-2">
                        <div class="inline-flex space-x-2">
                            <div innerHTML={props.component.label} />
                            <Show when={props.component.required}>
                                <span class="text-pink-600">*</span>
                            </Show>
                            <Show when={props.component.hint}>
                                <button class="bg-transparent text-gray-300 rounded-full focus:outline-none h-4 w-4 hover:bg-gray-400 hover:text-white flex justify-center items-center"
                                    onClick={showInstruction}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                            </Show>
                        </div>
                        <div class="flex mt-2">
                            <Show when={instruction()}>
                                <div class="italic text-xs font-extralight text-zinc-400 " innerHTML={props.component.hint} />
                            </Show>
                        </div>
                    </div>
                    <div class="font-light text-sm space-x-2 py-2.5 px-2 md:col-span-2 grid grid-cols-12">
                        <div class=""
                            classList={{
                                'col-span-11 lg:-mr-4': enableRemark(),
                                'col-span-12': !(enableRemark()),
                            }}  >
                            <div
                                classList={{
                                    ' border-b border-orange-500 pb-3 ': props.classValidation === 1,
                                    ' border-b border-pink-600 pb-3 ': props.classValidation === 2,
                                }}
                            >
                                <div class="grid font-light text-sm col-span-2 content-start"
                                    classList={{
                                        'grid-cols-1': props.component.cols === 1 || props.component.cols === undefined,
                                        'grid-cols-2': props.component.cols === 2,
                                        'grid-cols-3': props.component.cols === 3,
                                        'grid-cols-4': props.component.cols === 4,
                                        'grid-cols-5': props.component.cols === 5,
                                    }}
                                >
                                    <For each={options()}>
                                        {(item, index) => (
                                            <Switch>
                                                <Match when={(item.open) && (tick(item.value))}>
                                                    <div class="font-light text-sm space-x-2 py-2.5 px-4 grid grid-cols-12">
                                                        <div class="col-span-1">
                                                            <label class="cursor-pointer text-sm" for={"chexbox" + index()}>
                                                                <input class="form-check-input appearance-none h-4 w-4 border 
                                                            border-gray-300 rounded-sm bg-white 
                                                            checked:bg-blue-600 checked:border-blue-600 
                                                            focus:outline-none transition duration-200 align-top 
                                                            bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                                                    type="checkbox"
                                                                    onChange={e => handleOnChange(e.currentTarget.value, item.label, item.open)} value={item.value}
                                                                    checked={(item.value) ? tick(item.value) : false} id={"checkbox-" + props.component.dataKey + "-" + index()} />
                                                            </label>
                                                        </div>
                                                        <div class="col-span-11">
                                                            <input type="text" value={optionLabel(item.value)}
                                                                class="w-full
                                                            font-light
                                                            px-4
                                                            py-2.5
                                                            text-sm
                                                            text-gray-700
                                                            bg-white bg-clip-padding
                                                            border border-solid border-gray-300
                                                            rounded
                                                            transition
                                                            ease-in-out
                                                            m-0
                                                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                                                onChange={e => handleOnChange(item.value, e.currentTarget.value, item.open)}
                                                            />
                                                        </div>
                                                    </div>
                                                </Match>
                                                <Match when={!(item.open) || !(tick(item.value))}>
                                                    <div class="font-light text-sm space-x-2 py-2.5 px-4 grid grid-cols-12" onClick={e => handleLabelClick(index())}>
                                                        <div class="col-span-1">
                                                            <label class="cursor-pointer text-sm">
                                                                <input class="form-check-input appearance-none h-4 w-4 border 
                                                                border-gray-300 rounded-sm bg-white 
                                                                checked:bg-blue-600 checked:border-blue-600 
                                                                focus:outline-none transition duration-200 mt-1 align-top 
                                                                bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer
                                                                checked:disabled:bg-gray-500 checked:dark:disabled:bg-gray-300 
                                                                disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                                                                    type="checkbox"
                                                                    disabled={disableInput()}
                                                                    onChange={e => handleOnChange(e.currentTarget.value, item.label, item.open)} value={item.value}
                                                                    checked={(item.value) ? tick(item.value) : false} id={"checkbox-" + props.component.dataKey + "-" + index()} />
                                                            </label>
                                                        </div>
                                                        <div class="col-span-11" innerHTML={item.label}></div>
                                                    </div>
                                                </Match>
                                            </Switch>
                                        )}
                                    </For>
                                </div>
                            </div>
                            <Show when={props.validationMessage.length > 0}>
                                <For each={props.validationMessage}>
                                    {(item: any) => (
                                        <div
                                            class="text-xs font-light mt-1">
                                            <div class="grid grid-cols-12"
                                                classList={{
                                                    ' text-orange-500 dark:text-orange-200 ': props.classValidation === 1,
                                                    ' text-pink-600 dark:text-pink-200 ': props.classValidation === 2,
                                                }} >
                                                <Switch>
                                                    <Match when={props.classValidation === 1}>
                                                        <div class="col-span-1 flex justify-center items-start">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </div>
                                                    </Match>
                                                    <Match when={props.classValidation === 2}>
                                                        <div class="col-span-1 flex justify-center items-start">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    </Match>
                                                </Switch>
                                                <div class="col-span-11 text-justify mr-1" innerHTML={item} />
                                            </div>
                                        </div>
                                    )}
                                </For>
                            </Show>
                        </div>

                        <Show when={enableRemark()}>
                            <div class=" flex justify-end ">
                                <button class="relative inline-block bg-white p-2 h-10 w-10 text-gray-500 rounded-full  hover:bg-yellow-100 hover:text-yellow-400 hover:border-yellow-100 border-2 border-gray-300 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
                                    disabled={disableClickRemark()}
                                    onClick={e => props.openRemark(props.component.dataKey)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    <span class="absolute top-0 right-0 inline-flex items-center justify-center h-6 w-6
									text-xs font-semibold text-white transform translate-x-1/2 -translate-y-1/4 bg-pink-600/80 rounded-full"
                                        classList={{
                                            'hidden': props.comments === 0
                                        }}>
                                        {props.comments}
                                    </span>
                                </button>
                            </div>
                        </Show>
                    </div>
                </div>
            </Show>
        </div>
    )

}

export default CheckboxInput