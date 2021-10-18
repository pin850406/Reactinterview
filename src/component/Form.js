import { useForm } from "react-cool-form";
import { useTable, useRowSelect, useSortBy, useAsyncDebounce, useGlobalFilter } from "react-table";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import './table.css'
const Styles = styled.div`
  padding: 5rem 1rem;

  table {
    margin-left: auto;
    margin-right: auto;
    border-spacing: 0;
    border: 1px solid black;
    color: #000;
    border-color: #000;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      border-color: #000;
      :last-child {
        border-right: 0;
      }
    }
  }
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const RemoveButton = styled.button`
  background-color: #f44336;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 1rem;
`;

const Field = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...rest} />
  </div>
);

const Textarea = ({ label, id, ...rest }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} {...rest} />
  </div>
);

const GlobalFilter = ({ filter, setFilter }) => {
  const [value, setValue] = useState(filter)
  const onChange = useAsyncDebounce(value => {
    setFilter(value || undefined)
  }, 1000)
  return (
    <span>
      Search Restaurant Name:{' '}
      <input
        value={value || ''}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />
    </span>
  )
}

function Form() {
  const [data, setData] = useState([]);

  const { form } = useForm({
    defaultValues: {
      name: "",
      rating: "",
      comment: "",
    },
    onSubmit: (values) => {
      setData((data) => [...data, values]);
    },
  });

  const columns = useMemo(
    () => [
      {
        Header: "Restaurant Name",
        accessor: "name",
      },
      {
        Header: "Rating",
        accessor: "rating",
      },
      {
        Header: "Review",
        accessor: "comment",
      },
    ],
    []
  );

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef();
      const resolvedRef = ref || defaultRef;

      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
      }, [resolvedRef, indeterminate]);

      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      );
    }
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { selectedRowIds },
    setGlobalFilter,
    state
  } = useTable(
    {
      columns,
      data,
    },
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",

          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),

          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    },
    
  );
  const {globalFilter} = state

  const handleRemoveData = useCallback(() => {
    const removeIndex = Object.keys(selectedRowIds);
    for (var i = removeIndex.length - 1; i >= 0; i--) {
      data.splice(parseInt(removeIndex[i]), 1);
    }
    setData(data.slice());
  }, [setData, data, selectedRowIds]);


  return (
    <>
    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      <form ref={form}>
        <Field label="Restaurant Name" id="name" name="name" />
        <Field
          label="Rating"
          id="rating"
          name="rating"
          type="number"
          min="1"
          max="5"
        />
        <Textarea label="Review" id="comment" name="comment" />
        <input type="submit" value="Save" />
      </form>
      <Styles>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Styles>
      <StyledDiv>
        <RemoveButton onClick={handleRemoveData}>Delete Comment</RemoveButton>
      </StyledDiv>
    </>
  );
}

export default Form;
