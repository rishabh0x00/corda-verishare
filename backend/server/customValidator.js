import validate from 'validate.js'
import crypto from 'crypto'

var validators = {}

validators.verifyRSASignature = (value, options, key, attributes) => {
  try {
    const verifier = crypto.createVerify('SHA256')
    verifier.update(attributes.walletAddress)
    if (!verifier.verify(Buffer.from(attributes.rsaPubKey, 'hex').toString(), value, 'hex')) return 'invalid'
  } catch (error) {
    return error.message
  }
}

Object.assign(validate.validators, validators)

export default validate
