const crypto = require('crypto');

const key = crypto.scryptSync(process.env.SECRET_KEY, process.env.SALT, 32);

const cryptoCipher = {
     encrypt : (text)=>  {
        let cipher = crypto.createCipheriv('aes-256-ecb', key, null);
        let encrypted = cipher.update(text, 'utf-8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    },

    decrypt: (encryptedText) => {
        let decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted.toString();
    },

    decrypt_multi: (encrypted_stringList, exceptItem = []) => {
        
        let decrypted_stringList = {...encrypted_stringList}
        try {
            
            for( i in encrypted_stringList)
            {   
                if(exceptItem.includes(i))
                {
                    decrypted_stringList[i] = encrypted_stringList[i]
                    continue;
                }
                decrypted_stringList[i] = cryptoCipher.decrypt(encrypted_stringList[i])
            }
            
            return decrypted_stringList
        } catch (error) {
            
            console.log(error.message);
            
        }

    }
}

module.exports = cryptoCipher
// Text send to encrypt function
//var hw = cryptoCipher.encrypt("thanhphong@ES.vn")
//console.log(hw)
//console.log(cryptoCipher.decrypt(hw))
// console.log(key.toString('hex'));
// console.log(key2.toString('hex'));

