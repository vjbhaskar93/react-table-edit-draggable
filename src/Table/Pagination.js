import React from 'react'
import { Pagination, Form, FormGroup, FormControl } from 'react-bootstrap'
import map from 'lodash/map';
import times from 'lodash/times';
import PageSize from './Rowsize'

const PaginationList = (chunkSize, showPageSizeOptions, setPageSizeOption) => props => {
    const {  page, onPageChange, onPageSizeChange, pageSizeOptions, canPrevious, canNext, data} = props

    if (!data || data.length === 0 || data.length <= 15) return (<div/>)
    const pageSize = 5;
    let pages = Math.ceil( data.length / chunkSize );

    const chunksOfPages = Math.ceil(pages / pageSize)
    const myChunkPagePosition = Math.floor(page / pageSize)
    const myChunkPageNumber = myChunkPagePosition + 1
    const offset = myChunkPagePosition * pageSize

    const firstChunk = 1 // to add meaning 
    const lastChunk = chunksOfPages

    let pagesToShow = pageSize
    if (myChunkPageNumber === lastChunk && (pages % pageSize) !== 0) { // when my page is in the last chunk and that chuck has less than n pages
        pagesToShow = pages % pageSize
    }

    const items = times(pagesToShow, index => {
        const pagePosition = offset + index
        const pageNumber = pagePosition + 1
        return (
            <Pagination.Item key={pageNumber} onClick={() => onPageChange(pagePosition)} active={pagePosition === page} >
                {pageNumber}
            </Pagination.Item>
        )
    })

    const firstPage = (
        <Pagination.Item onClick={() => onPageChange(0)} active={0 === page} >
            1
    </Pagination.Item>
    )

    const LastPage = (
        <Pagination.Item onClick={() => onPageChange(pages - 1)} active={pages === page} >
            {pages}
        </Pagination.Item>
    )
    const ellipsis = <Pagination.Ellipsis />

    return (
        <div className="d-flex justify-content-center bs-flex-example-parent pagination-container">                             
            <div className="p-1 bs-flex-example-item">
                <Pagination bsSize="small">
                    <Pagination.Prev disabled={!canPrevious} onClick={() => onPageChange(page - 1)} />
                    {myChunkPageNumber > firstChunk && firstPage}
                    {myChunkPageNumber > firstChunk && ellipsis}
                    {items}
                    {myChunkPageNumber < lastChunk && ellipsis}
                    {myChunkPageNumber < lastChunk && LastPage}
                    <Pagination.Next disabled={!canNext} onClick={() => onPageChange(page + 1)} />
                </Pagination>
            </div>

            {showPageSizeOptions &&
                <div className="p-1 bs-flex-example-item">
                    <Form inline>
                        <FormGroup bsSize="small" className="mb-0">
                            <FormControl componentClass="select" value={pageSize} onChange={e => onPageSizeChange(parseInt(e.target.value))}>
                                {
                                    map(pageSizeOptions, sizeOption => <option key={sizeOption}> {sizeOption} </option>)
                                }
                            </FormControl>

                        </FormGroup>
                    </Form>
                </div>
            }
                <PageSize listName="blockList" pageSizeOptions={pageSizeOptions} pageSize={chunkSize} 
             setPageSizeOption = {setPageSizeOption} />
        </div>

    )
}

export default PaginationList 