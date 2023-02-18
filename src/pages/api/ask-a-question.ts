import type { NextApiRequest, NextApiResponse } from "next";
import openAI from "@/config";

type Data = {
    result?: string | undefined
    error?: string
}

const timeoutPromise = (timeout: number) =>
    new Promise<never>((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Tempo limite excedido'));
        }, timeout);
    });

const createCompletionWithTimeout = async (
    question: string,
    timeout: number
) => {
    const completion = openAI.createCompletion({
        model: 'text-davinci-002',
        prompt: question,
        temperature: 0.8,
        max_tokens: 2048
    });

    return Promise.race([completion, timeoutPromise(timeout)]);
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (!req.body?.question) {
        res.status(400).json({ error: 'Invalid params' })
    }


    createCompletionWithTimeout(req?.body?.question, 120000).then((response) => {
        return res.status(200).json({ result: response.data?.choices?.[0].text })
    })
}