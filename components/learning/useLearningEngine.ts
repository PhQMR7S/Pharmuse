'use client';
import {useEffect,useState} from 'react';
import {hydrateEngine} from '@/lib/engine/core';
import {engineLessons} from '@/lib/engine/catalog';
import {INITIAL_ENGINE,type EngineState} from '@/lib/engine/model';
export const ENGINE_KEY='pharmuse-engine-v11';
export function useLearningEngine(){
 const [engine,setEngine]=useState<EngineState>(INITIAL_ENGINE),[ready,setReady]=useState(false),[storageError,setStorageError]=useState(false);
 useEffect(()=>{try{setEngine(hydrateEngine(JSON.parse(localStorage.getItem(ENGINE_KEY)??'null'),engineLessons))}catch{setStorageError(true)}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(ENGINE_KEY,JSON.stringify(engine))}catch{setStorageError(true)}},[engine,ready]);
 return {engine,setEngine,ready,storageError};
}
