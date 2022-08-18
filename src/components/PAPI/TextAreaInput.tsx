import { createSignal, For, Match, Show, Switch } from "solid-js"
import { FormComponentBase } from "../../FormType"
import { InputContainer } from "./partials"

const TextAreaInput: FormComponentBase = props => {
  const config = props.config
  const [disableInput] = createSignal((config.formMode > 1) ? true : props.component.disableInput)

  let classInput = 'w-full rounded font-light px-4 py-2.5 text-sm text-gray-700 bg-white bg-clip-padding transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400';
  
  return (
    <InputContainer component={props.component} classValidation={props.classValidation} validationMessage={props.validationMessage}>
      <Show when={props.component.lengthInput === undefined}>
        <textarea value={props.value}
          rows={props.component.rows || 2}
          class={classInput}
          classList={{
            ' border border-solid border-gray-300 ': props.classValidation === 0,
            ' border-orange-500 dark:bg-orange-100 ': props.classValidation === 1,
            ' border-pink-600 dark:bg-pink-100 ': props.classValidation === 2,
          }}
          disabled={disableInput()}
          onChange={(e) => {
            props.onValueChange(e.currentTarget.value)
          }}
        />
      </Show>
      <Show when={props.component.lengthInput !== undefined && props.component.lengthInput.length > 0}>
        <textarea value={props.value}
          rows={props.component.rows || 2}
          class={classInput}
          classList={{
            ' border border-solid border-gray-300 ': props.classValidation === 0,
            ' border-orange-500 dark:bg-orange-100 ': props.classValidation === 1,
            ' border-pink-600 dark:bg-pink-100 ': props.classValidation === 2,
          }}
          disabled={disableInput()}
          onChange={(e) => {
            props.onValueChange(e.currentTarget.value)
          }}
          maxlength={props.component.lengthInput[0].maxlength !== undefined ? props.component.lengthInput[0].maxlength : ''}
          minlength={props.component.lengthInput[0].minlength !== undefined ? props.component.lengthInput[0].minlength : ''}
        />
      </Show>
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
    </InputContainer>
  )
}

export default TextAreaInput