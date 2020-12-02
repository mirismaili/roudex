/**
 * Created on 1399/9/12 (2020/12/2).
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 */

export const payloadReducer = (srcState, dstState, ...payloads) => {
	if (typeof dstState !== 'object' || dstState === null) {
		console.error('dstState is not an object (or is null):\n', dstState)
		return null
	}
	
	if (Object.keys(dstState).length !== 0)
		console.warn('dstState is not an empty object!\n', dstState)
	
	let noTransform = true
	
	for (const [i, payload] of payloads.entries()) {
		if (typeof payload !== 'object' || payload === null) {
			console.error(`payload ${i} (payloads[${i}]) is not an object (or is null):\n${payload}`)
			return null
		}
		
		if (!new PayloadReducer(srcState).reduce(payload, dstState)
				&& noTransform) // `&& noTransform` can be removed
			noTransform = false
	}
	
	return noTransform
}

// noinspection JSUnfilteredForInLoop
class PayloadReducer {
	constructor(srcState) {
		this.srcState = srcState
	}
	
	reduce(payload, dstState) {
		return this.reduceR(this.srcState, payload, dstState)
	}
	
	reduceR(srcState, payload, dstState) {
		let noTransform = true
		
		for (const [key, subSrcState] of Object.entries(srcState)) {
			if (!(key in payload)) {
				dstState[key] = subSrcState
				continue
			}
			
			const subPayload = payload[key]
			
			if (typeof subSrcState === 'object' && subSrcState !== null &&
					typeof subPayload === 'object' && subPayload !== null) {
				// both are objects:
				dstState[key] = {}
				
				if (!this.reduceR(subSrcState, subPayload, dstState[key])
						&& noTransform) // `&& noTransform` can be removed
					noTransform = false
				
				continue
			}
			// at least one isn't an object:
			
			if (subSrcState !== subPayload) noTransform = false
			
			dstState[key] = typeof subPayload === 'function' ? subPayload(subSrcState, this.srcState) : subPayload
		}
		
		for (const key in payload) if (!(key in srcState)) {
			console.warn(`Existed key (${key}) in payload, is not present in srcState!`)
			noTransform = false
			dstState[key] = payload[key]
		}
		
		return noTransform
	}
}
