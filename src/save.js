/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */

import { useBlockProps } from '@wordpress/block-editor';
import React from 'react'
import axios from 'axios';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */

const { Component } = wp.element;

export default function save(props) {	
	
	const {attributes,setAttributes} = props
	const {data} = attributes
	
	return (
		
		<div {...useBlockProps.save()}>
			{
				data && (
					<>
					<div className='flex'>
						<h3>{data.title}</h3> 						
					</div>
						
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
													return attributes?.headers?.includes(data.data.headers[index])??true
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
	);
}

	

