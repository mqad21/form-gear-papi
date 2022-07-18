import { FormComponentBase } from "../FormType"
import { For, createMemo, Switch, Match, Show, createSignal } from 'solid-js'
import { reference } from '../stores/ReferenceStore';
import { ClientMode } from "../Constant";
import { sidebar } from "../stores/SidebarStore";
import FormInput from "../FormInput";

const NestedInput: FormComponentBase = props => {

	const config = props.config
	const [btnLabel] = createSignal((config.formMode > 1) ? 'VIEW' : 'ENTRY')

	let componentAnswerIndex = createMemo(() => {
		return String(reference.details.findIndex(obj => obj.dataKey === props.component.sourceQuestion));
	})

	const [instruction, setInstruction] = createSignal('');
	const showInstruction = (dataKey) => {
		(instruction() == dataKey) ? setInstruction("") : setInstruction(dataKey);
	}

	let sourceAnswer = createMemo(() => {
		let answer = [];
		if (props.component.sourceQuestion !== '') {
			const componentAnswerIndex = reference.details.findIndex(obj => obj.dataKey === props.component.sourceQuestion);
			if (reference.details[componentAnswerIndex]) {
				if (typeof reference.details[componentAnswerIndex].answer === 'object') {
					answer = reference.details[componentAnswerIndex].answer == '' ? [] : reference.details[componentAnswerIndex].answer;
					if (reference.details[componentAnswerIndex].type == 21 || reference.details[componentAnswerIndex].type == 22) {
						let tmpAnswer = JSON.parse(JSON.stringify(answer));
						tmpAnswer.splice(0, 1);
						answer = tmpAnswer;
					}
				} else {
					answer = reference.details[componentAnswerIndex].answer == '' ? 0 : reference.details[componentAnswerIndex].answer;
					let dummyArrayAnswer = [];
					for (let i = 1; i <= Number(answer); i++) {
						dummyArrayAnswer.push({ value: i, label: i });
					}
					answer = dummyArrayAnswer;
				}
			}
		}
		return answer;
	})

	let handleLabelClick = (index: any) => {
		let id = `nestedButton-${props.component.dataKey}-${index}`
		document.getElementById(id).click()
	}

	let handleOnClick = (value: string) => {
		props.onUserClick(props.component.dataKey + '#' + value);
	}

	return (
		<Switch>
			<Match when={config.clientMode == ClientMode.CAPI || config.clientMode == ClientMode.CAWI}>
				<div class="grid md:grid-cols-12 dark:border-gray-200/[.10] p-2"
					classList={{
						'border-b border-gray-300/[.40]': sourceAnswer().length > 0
					}}	>
					<div class="font-light text-sm  pb-2.5 px-2 col-start-2 col-end-12 space-y-4 transition-all delay-100">
						<For each={sourceAnswer()}>
							{(item: any, index) => (
								<div class="grid grid-cols-12" onClick={e => handleOnClick(item.value)}>
									<div class="col-span-10 mr-2">
										<Switch>
											<Match when={(reference.details[componentAnswerIndex()].type === 28 || (reference.details[componentAnswerIndex()].type === 4 && reference.details[componentAnswerIndex()].renderType === 1) || reference.details[componentAnswerIndex()].type === 25)}>
												<input type="text" value={props.component.label + '  ____ # ' + item.label}
													class="w-full
													font-light
													px-4
													py-2.5
													text-sm
													text-gray-700
													bg-blue-50 bg-clip-padding
													dark:bg-gray-300
													border border-solid border-blue-100	
													rounded-full rounded-tl-none
													transition
													ease-in-out
													m-0
													focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
													disabled
												/>
											</Match>
											<Match when={(reference.details[componentAnswerIndex()].type !== 28)}>
												<input type="text" value={item.label}
													class="w-full
													font-light
													px-4
													py-2.5
													text-sm
													text-gray-700
													bg-blue-50 bg-clip-padding
													dark:bg-gray-300
													border border-solid border-blue-100	
													rounded-full rounded-tl-none
													transition
													ease-in-out
													m-0
													focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
													disabled
												/>
											</Match>
										</Switch>
									</div>
									<div class="col-span-2 -ml-12 space-x-1 flex justify-evenly -z-0">
										<button class="bg-blue-800 hover:bg-blue-700 text-white text-justify justify-center text-xs w-full py-2 rounded-tl-none rounded-full focus:outline-none group inline-flex items-center"
											onClick={e => handleOnClick(item.value)} id={`nestedButton-${props.component.dataKey}-${index()}`}>
											&nbsp;&nbsp;{btnLabel}
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-5" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
											</svg>
										</button>
									</div>
								</div>
							)}
						</For>
					</div>
				</div>
			</Match>
			<Match when={config.clientMode == ClientMode.PAPI}>
				<div class="relative max-w-full overflow-auto">
					<table class="table-auto border-2 max-w-full">
						<thead>
							<tr>
								<For each={props.component?.components[0]}>
									{(item, index) => {
										return (
											<th
												class="border-2 p-3 bg-white align-top"
												classList={{
													'sticky left-0 top-0': index() == 0,
												}}
											>
												<div class="mb-1">
													{item.label.replace(/\$(\w+)\$/g, '').replace(/\s+/g, " ")}
													<Show when={item.options}>
														<button class="bg-transparent text-gray-300 rounded-full focus:outline-none h-4 w-4 align-center ml-1 hover:bg-gray-400"
															onClick={() => showInstruction(item.dataKey)}>
															<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
																<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
														</button>
													</Show>
												</div>
												<div class="font-light text-sm space-y-2 py-2.5 px-2">
													<Show when={instruction() === item.dataKey}>
														<div class="flex mt-2">
															<p class="text-xs font-light text-left" innerHTML=
																{item.options?.map(opt => opt.label).join("<br/>")}>
															</p>
														</div>
													</Show>
												</div>
											</th>
										)
									}}
								</For>
							</tr>
						</thead>
						<tbody>
							<For each={sourceAnswer()}>
								{(item: any, index) => {
									const dataKey = props.component.dataKey + '#' + item.value
									const position = sidebar.details.findIndex(obj => obj.dataKey === dataKey);
									const components = sidebar.details[position].components[0]
									return (
										<tr>
											<For each={components}
												children={(component: any, index) => {
													return (
														<td
															class="bg-white border-2"
															classList={{
																'sticky left-0 top-0': index() == 0,
															}}
														>
															{FormInput({
																onMobile: props.onMobile,
																component,
																index: index(),
																config: props.config,
																MobileUploadHandler: props.MobileUploadHandler,
																MobileGpsHandler: props.MobileGpsHandler,
																MobileOfflineSearch: props.MobileOfflineSearch,
																MobileOnlineSearch: props.MobileOnlineSearch,
																MobileOpenMap: props.MobileOpenMap,
																setResponseMobile: props.setResponseMobile,
																isNestedInput: true
															})}
														</td>
													)
												}
												}
											/>
										</tr>
									)
								}}
							</For>
						</tbody>
					</table>
				</div>
			</Match>
		</Switch>
	)
}

export default NestedInput