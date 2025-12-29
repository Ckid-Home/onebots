/**
 * Ed25519 签名和验证
 * 用于 QQ 官方机器人 Webhook 签名验证
 * 参考: https://github.com/zhinjs/qq-official-bot/blob/master/src/ed25519.ts
 */

// @ts-ignore - @noble/curves 可能没有完整的类型定义
import { ed25519 } from '@noble/curves/ed25519';

export class Ed25519 {
    #privateKey: Buffer;
    
    get #publicKey() {
        return ed25519.getPublicKey(this.#privateKey);
    }
    
    constructor(secret: string) {
        // 确保密钥长度为 32 字节
        while (secret.length < 32) {
            secret = secret.repeat(2);
        }
        secret = secret.slice(0, 32);
        this.#privateKey = Buffer.from(secret);
    }
    
    /**
     * 签名消息
     * @param message 要签名的消息（字符串）
     * @returns 签名的十六进制字符串
     */
    sign(message: string): string {
        // 参考 qq-official-bot 的实现
        // 将消息转换为 hex 字符串，然后签名
        const content = Buffer.from(message, 'utf8').toString('hex');
        const signResult = ed25519.sign(content, this.#privateKey);
        return Buffer.from(signResult.buffer).toString('hex');
    }
    
    /**
     * 验证签名
     * @param signature 签名的十六进制字符串
     * @param message 原始消息（字符串）
     * @returns 验证是否通过
     */
    verify(signature: string, message: string): boolean {
        try {
            // 参考 qq-official-bot 的实现
            // signature 是 hex 字符串，message 转换为 Buffer
            const signatureBuffer = Buffer.from(signature, 'hex');
            const messageBuffer = Buffer.from(message, 'utf8');
            return ed25519.verify(signatureBuffer, messageBuffer, this.#publicKey);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 获取公钥（用于调试）
     */
    getPublicKey(): Buffer {
        return Buffer.from(this.#publicKey);
    }
}

/**
 * ed25519 curve with EdDSA signatures.
 */
export default ed25519;

