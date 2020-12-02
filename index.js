import {useEffect, useReducer} from 'react'
import {payloadReducer} from './utilities'

/**
 * Created on 1399/9/7 (2020/11/27).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

export const defaultLogger = (state, action, newState = null) => {
	console.group(
			'%c%s %c%s %c%s %s', 'font-weight:normal;color:#888', 'action',
			'color:#222', action.type,
			'font-weight:normal;color:#888', '@', new Date().toLocaleTimeString(),
	)
	// console.groupCollapsed('%c%s', 'font-weight:bold;color:#9E9E9E', 'prev-state')
	// console.log('%c%s', 'font-weight:bold;color:#9E9E9E', JSON.stringify(state0, null, '\t'))
	// console.groupEnd()
	
	console.log('%c%s\t%o', 'font-weight:bold;color:#9E9E9E', 'prev-state', state)
	
	console.log('%c%s\t', 'font-weight:bold;color:#03A9E4', 'action', action)
	
	console.log('%c%s\t%o', 'font-weight:bold;color:#4CAF50', 'new-state', newState ?? 'NO-TRANSFORM')
	
	// console.groupCollapsed('%c%s', 'font-weight:bold;color:#4CAF50', 'new-state')
	// console.log('%c%s', 'font-weight:bold;color:#4CAF50', JSON.stringify(newState, null, '\t'))
	// console.groupEnd()
	console.groupEnd()
}

export class StateManager {
	static init(initialState,
					payloadCreators,
					createPayloadFromUrl,
					createPathFromState,
					{
						logger = process.env.NODE_ENV === 'production' ? null : defaultLogger,
					} = {}) {
		StateManager.defaultInitialState = initialState
		StateManager.defaultInitialState.serial = 0
		
		StateManager.payloadCreators = payloadCreators
		
		StateManager.rootReducer = (state, action) => {
			if (action.state) {
				if (action.payload)
					console.warn('The action provides both `payload` and `state`!\n' +
							'Provided `payload` will be ignored.\naction:\n', action)
				
				const newState = action.state
				
				action.type += newState.serial > state.serial ? 'FWD' : 'BACK'
				
				// eslint-disable-next-line no-unused-expressions
				logger?.(state, action, newState)
				return newState
			}
			
			if (action.url) {
				if (action.payload)
					console.warn('The action provides both `payload` and `url`!\n' +
							'Provided `payload` will be ignored and overridden.\naction:\n', action)
				action.payload = createPayloadFromUrl(action.url)
			}
			const {payload} = action
			
			const newState = {}
			if (payloadReducer(state, newState, payload)) { // noTransform:
				// eslint-disable-next-line no-unused-expressions
				logger?.(state, action)
				return state
			}
			
			newState.serial++
			
			const url0 = window.location.href
			const newUrl = new URL(url0).origin + createPathFromState(newState)
			
			const replaceOrPushState = action.url || newUrl === url0 ? 'replaceState' : 'pushState'
			window.history[replaceOrPushState](newState, '', newUrl)
			
			// eslint-disable-next-line no-unused-expressions
			logger?.(state, action, newState)
			
			return newState
		}
		
		StateManager.initializer = defaultInitialState =>
				StateManager.rootReducer(window.history.state ?? defaultInitialState, {
					type: 'INIT',
					url: window.location.href,
				})
	}
	
	static useStore() {
		const [state, dispatch] = useReducer(
				StateManager.rootReducer,
				StateManager.defaultInitialState,
				StateManager.initializer,
		)
		
		const popStateListener = ({state}) => dispatch({
			type: 'POP-',
			state,   // special action with full `state` instead of `payload`
		})
		
		useEffect(() => {
			window.addEventListener('popstate', popStateListener)
			return () => window.removeEventListener('popstate', popStateListener)
		}, [])
		
		const dp = Object.fromEntries(Object.entries(StateManager.payloadCreators).map(
				([type, payloadCreator]) => ([
					type,
					(...args) => dispatch({
						type,
						payload: payloadCreator(...args),
					}),
				]),
		))
		
		return {state, dp, dispatch}
	}
}

export default StateManager

export const useStore = StateManager.useStore
