/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */

import { __ } from '@wordpress/i18n';
import React,{useEffect,useState,useMemo} from 'react'
import axios from 'axios'

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */

import { useBlockProps,InspectorControls } from '@wordpress/block-editor';
import {CheckboxControl} from '@wordpress/components'

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */

import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */

export default function Edit({attributes,setAttributes}) {
	
	const {data} = attributes

	const defaultHeaders = useMemo(()=>{
		if(data)
		{
			return data.data.headers
		}
		else 
		{
			return []
		}
	},[data])

	const refresh = () => {
		fetch('https://miusage.com/v1/challenge/1/').then(res=>res.json()).then(res=>setAttributes({data:res}))	
	}	

	return (
		<>
		<InspectorControls>
			{
				defaultHeaders.map(item=>(
					<CheckboxControl checked={attributes?.headers?.includes(item)??true} onChange={()=>{
						if(attributes?.headers?.includes(item))
						{
							setAttributes({headers:attributes.headers.filter(h=>h!==item)})
						}
						else if(!attributes?.headers) 
						{
							setAttributes({headers:defaultHeaders.filter(h=>h!==item)})
						}
						else 
						{
							setAttributes({headers:[item,...attributes?.headers]})
						}
					}} label={item}></CheckboxControl>
				))
			}
		</InspectorControls>

		<div { ...useBlockProps() }>

			<button id="refresh" onClick={refresh}>Refresh</button>
			{
				data && (
					<>
						<h3>{data.title}</h3>
						<table className='table table-responsible'>
							<thead>
								{
									data.data.headers.filter(item=>attributes?.headers?.includes(item)??true).map(item=>(
										<th>{item}</th>
									))
								}
							</thead>
							<tbody>
								{
									Object.keys(data.data.rows).map((rowKey)=>(
										<tr key={rowKey}>
											{
												Object.keys(data.data.rows[rowKey]).filter((_,index)=>{
													return attributes?.headers?.includes(defaultHeaders[index])??true
												}).map((itemKey)=>(
													<td key={itemKey}>{data.data.rows[rowKey][itemKey]}</td>
												))
											}
										</tr>
									))
								}
							</tbody>
						</table>
					</>
				)
			}
			
		</div>
		</>
	);
}
