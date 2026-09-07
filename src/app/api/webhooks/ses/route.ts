import {NextResponse} from 'next/server';
import {sesFeedback} from '@/server/sesFeedback';
import {body,failure} from '@/server/http';
export async function POST(request:Request){try{
  // SNS commonly sends text/plain; reuse the bounded streaming JSON parser.
  const headers=new Headers(request.headers);headers.set('content-type','application/json');
  const wrapped=new Request(request,{headers});
  return NextResponse.json(await sesFeedback(await body(wrapped)));
}catch(error){return failure(error);}}
