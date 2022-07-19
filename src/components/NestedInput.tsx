import { FormComponentBase } from "../FormType"
import { For, createMemo, Switch, Match, Show, createSignal } from 'solid-js'
import { reference } from '../stores/ReferenceStore';
import { ClientMode } from "../Constant";
import { sidebar } from "../stores/SidebarStore";
import FormInput from "../FormInput";
import { cleanLabel } from "../GlobalFunction";
import { locale } from "../stores/LocaleStore";
import Toastify from 'toastify-js'
import { handleInputFocus, handleInputKeyDown } from "../Event";

const NestedInput: FormComponentBase = props => {

	const config = props.config
	const [btnLabel] = createSignal((config.formMode > 1) ? 'VIEW' : 'ENTRY')
	const [flag, setFlag] = createSignal(0);
	const [edited, setEdited] = createSignal(0);
	const [tmpInput, setTmpInput] = createSignal('');
	const [disableInput] = createSignal((config.formMode > 1) ? true : props.component.disableInput)

	let newInputRef, editInputRef;

	let componentAnswerIndex = createMemo(() => {
		return String(reference.details.findIndex(obj => obj.dataKey === props.component.sourceQuestion));
	})

	const [instruction, setInstruction] = createSignal('');

	let localAnswer = createMemo(() => {
		const componentAnswerIndex = reference.details.findIndex(obj => obj.dataKey === props.component.sourceQuestion);
		return reference.details[componentAnswerIndex].answer
	})

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

	let getLastId = createMemo(() => {
		const lastAnswer = sourceAnswer()[sourceAnswer().length - 1]
		return Number(lastAnswer?.value);
	})

	const toastInfo = (text: string) => {
		Toastify({
			text: (text == '') ? locale.details.language[0].componentDeleted : text,
			duration: 3000,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
			className: "bg-blue-600/80",
			style: {
				background: "rgba(8, 145, 178, 0.7)",
				width: "400px"
			}
		}).showToast();
	}

	const modalDelete = () => {
		let titleModal = document.querySelector("#titleModalDelete");
		let contentModal = document.querySelector("#contentModalDelete");
		titleModal.innerHTML = props.component.titleModalDelete !== undefined ? props.component.titleModalDelete : 'Confirm Delete?';
		contentModal.innerHTML = props.component.contentModalDelete !== undefined ? props.component.contentModalDelete : 'Deletion will also delete related components, including child components from this parent.';
	}

	const showInstruction = (dataKey) => {
		(instruction() == dataKey) ? setInstruction("") : setInstruction(dataKey);
	}

	let handleOnClick = (value: string) => {
		props.onUserClick(props.component.dataKey + '#' + value);
	}

	let handleOnPlus = () => {
		if (flag() === 0 && edited() === 0) {
			setFlag(1);//plus / edit
			setEdited(0);
			newInputRef.focus()
		} else {
			toastInfo(locale.details.language[0].componentNotAllowed);
		}
	}

	let handleOnSave = (id: number, value, localAnswer) => {
		if (value !== "") {
			setTmpInput(value)
		}

		setTimeout(() => {
			if (tmpInput() !== "") {
				let updatedAnswer = JSON.parse(JSON.stringify(localAnswer));
				if (edited() === 0) {
					updatedAnswer = [...updatedAnswer, { "value": id, "label": tmpInput() }];
					updatedAnswer[0].label = "lastId#" + id;
				} else {
					let answerIndex = updatedAnswer.findIndex((item) => item.value == id)
					updatedAnswer[answerIndex].label = tmpInput();
				}

				props.onValueChange(updatedAnswer, props.component.sourceQuestion);

				if (edited() === 0) {
					toastInfo(locale.details.language[0].componentAdded);
				} else {
					toastInfo(locale.details.language[0].componentEdited);
				}
				setFlag(0);
				setEdited(0);
			} else {
				if (edited() === 0) {
					toastInfo(locale.details.language[0].componentEmpty);
				} else {
					setFlag(0);
					setEdited(0);
				}
			}

		}, 500)

	}

	let handleOnEdit = (id: number) => {
		if (flag() === 0 && edited() === 0) {
			setFlag(1);
			setEdited(id);
			editInputRef.focus()
		} else {
			setEdited(id);
			editInputRef.focus()
		}
	}

	let handleOnDelete = (id: number) => {
		if (flag() === 0 && edited() === 0) {
			setFlag(2);
			setEdited(id);
			modalDelete();
		} else if (flag() === 1) {
			toastInfo("Only 1 component is allowed to edit");
		} else if (flag() === 2) {
			let updatedAnswer = JSON.parse(JSON.stringify(localAnswer()));
			let answerIndex = updatedAnswer.findIndex((item) => item.value == id);
			updatedAnswer.splice(answerIndex, 1);

			props.onValueChange(updatedAnswer, props.component.sourceQuestion);
			toastInfo(locale.details.language[0].componentDeleted);
			setFlag(0);
			setEdited(0);
		}
	}

	let handleOnCancel = () => {
		setTmpInput('');
		setFlag(0);
		setEdited(0);
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
				<Show when={(flag() == 2)}>
					<div class="modal-delete fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
						<div class="flex items-center justify-center min-h-screen pt-4 px-4 text-center sm:block sm:p-0">
							<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

							<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

							<div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
								<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<div class="sm:flex sm:items-start">
										<div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
											<svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
											</svg>
										</div>
										<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
											<h3 class="text-lg leading-6 font-medium text-gray-900" id="titleModalDelete">Deactivate account</h3>
											<div class="mt-2">
												<p class="text-sm text-gray-500" id="contentModalDelete">Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undonssse.</p>
											</div>
										</div>
									</div>
								</div>
								<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
									<button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" onClick={e => handleOnDelete(edited())}>Delete</button>
									<button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={e => handleOnCancel()}>Cancel</button>
								</div>
							</div>
						</div>
					</div>
				</Show>
				<div class="relative max-w-full overflow-auto nested-container">
					<table class="table-fixed border-2 max-w-full">
						<thead>
							<tr>
								<th class="border-2 p-3 bg-white align-top sticky left-0 top-0 outline outline-1 outline-gray-200 outline-offset-0"></th>
								<For each={props.component?.components[0]}>
									{(item, index) => {
										return (
											<th class="border-2 p-3 bg-white align-top">
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
												<div class="font-light text-sm py-1 px-0">
													<Show when={instruction() === item.dataKey}>
														<div class="flex mt-2">
															<p class="text-xs font-light text-left"
																innerHTML={item.options?.map(opt => {
																	return `[ ${opt.value} ] ${cleanLabel(opt.label)}`
																}).join("<br/>")}
															></p>
														</div>
													</Show>
												</div>
											</th>
										)
									}}
								</For>
								<th class="border-2 p-3 bg-white align-top sticky right-0 top-0 outline outline-1 outline-gray-200 outline-offset-0"></th>
							</tr>
						</thead>
						<tbody>
							<For each={sourceAnswer()}>
								{(item: any) => {
									const dataKey = props.component.dataKey + '#' + item.value
									const position = sidebar.details.findIndex(obj => obj.dataKey === dataKey);
									const components = sidebar.details[position]?.components[0]
									return (
										<tr>
											<td class="bg-white sticky left-0 top-0 px-4 py-2 outline outline-1 outline-gray-200 outline-offset-0 border-0">
												<div class="w-36">
													<Show when={flag() === 1 && edited() === item.value}>
														<input
															value={item.label}
															onKeyDown={e => handleInputKeyDown(e, props)}
															onChange={e => handleOnSave(item.value, e.target.value.trim(), localAnswer())} ref={editInputRef} type="text" class="w-full rounded font-light px-4 py-2.5 text-sm text-gray-700 bg-white bg-clip-padding transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400" />
													</Show>
													<Show when={flag() !== 1 || edited() !== item.value}>
														{item.label}
													</Show>
												</div>
											</td>
											<For each={components}
												children={(component: any, index) => {
													return (
														<td class="bg-white border-2">
															<div>
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
															</div>
														</td>
													)
												}
												}
											/>
											<td class="bg-white sticky right-0 top-0 px-4 py-2 outline outline-1 outline-gray-200 outline-offset-0 border-0">
												<div class="col-span-2 flex justify-end p-1 space-x-1 ">
													<Show when={flag() === 0 && edited() !== item.value}>
														<button class="bg-orange-400 text-white p-2 rounded-full focus:outline-none h-8 w-8 hover:bg-orange-300 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
															disabled={disableInput()}
															onClick={e => handleOnEdit(Number(item.value))}>
															<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
																<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
															</svg>
														</button>
													</Show>
													<Show when={flag() === 1 && edited() === item.value}>
														<button class="bg-gray-500 text-white p-2 rounded-full focus:outline-none h-8 w-8 h-8 hover:bg-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
															disabled={disableInput()}
															onClick={e => handleOnCancel()}>
															<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
																<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
															</svg>
														</button>
													</Show>
													<button class="bg-red-600 text-white p-2 rounded-full focus:outline-none h-8 w-8 hover:bg-red-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
														disabled={disableInput()}
														onClick={e => handleOnDelete(Number(item.value))}>
														<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
															<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
														</svg>
													</button>
												</div>
											</td>
										</tr>
									)
								}}
							</For>
							<Show when={(flag() == 1 && edited() == 0)}>
								<tr>
									<td class="bg-white sticky left-0 top-0 px-4 py-2 outline outline-1 outline-gray-200 outline-offset-0 border-0">
										<div class="w-36">
											<input
												onKeyDown={e => handleInputKeyDown(e, props)}
												onChange={e => handleOnSave((getLastId() + 1), e.target.value.trim(), localAnswer())} ref={newInputRef} type="text" class="w-full rounded font-light px-4 py-2.5 text-sm text-gray-700 bg-white bg-clip-padding transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400" />
											<input class="hidden-input h-0 bg-transparent border-0 outline-0 focus:outline-0 focus:border-0 focus:ring-0 caret-transparent" onFocus={e => handleInputFocus(e, props)} />
										</div>
									</td>
									<td colSpan={props.component?.components[0]?.length}></td>
									<td class="bg-white sticky right-0 top-0 px-4 py-2 outline outline-1 outline-gray-200 outline-offset-0 border-0">
										<div class="col-span-2 flex justify-end p-1 space-x-1 ">
											<button class="bg-gray-500 text-white p-2 rounded-full focus:outline-none h-8 w-8 h-8 hover:bg-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
												disabled={disableInput()}
												onClick={e => handleOnCancel()}>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
												</svg>
											</button>
										</div>
									</td>
								</tr>
							</Show>
						</tbody>
					</table>
				</div>
				<div class="flex p-4 justify-center">
					<button class="bg-pink-600 text-white p-2 rounded-full focus:outline-blue-700 focus:outline-3 h-8 w-8 hover:bg-pink-500  disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
						onKeyDown={e => handleInputKeyDown(e, props)}
						onClick={e => handleOnPlus()}>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
						</svg>
					</button>
				</div>
			</Match>
		</Switch>
	)
}

export default NestedInput