import {createHmac} from 'crypto';
import {hash,compare} from 'bcryptjs';
export const doHash=(value,saltValue)=>{
    return hash(value,saltValue)
};

export const doHashValidation=(value,hashedValue)=>{
    return compare(value,hashedValue);
}
export const hmacProcess=(value,key)=>{
    return createHmac('sha256',key).update(value).digest('hex');
}