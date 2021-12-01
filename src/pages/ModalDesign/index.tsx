import { useState, useEffect } from 'react';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout'
import { SchemaForm, SchemaMarkupField as Field, Submit, FormEffectHooks, createAsyncFormActions } from '@formily/antd'
import { Button, message, Spin } from 'antd';
import { useSetState } from 'ahooks';
import { request, useLocation, history, useModel } from 'umi';
import { Input, ArrayTable, Select, FormCard, Checkbox } from '@formily/antd-components'
import type { IFormEffect, IFieldState } from '@formily/react/lib'
import Modal from './Modal';
import * as enums from './enums'
import { schemaExample } from './initialValues'
import 'antd/dist/antd.css'
import styles from './index.less'

const modelDesignAction = createAsyncFormActions()

function Index() {

  const [modalVisible, setModalVisible] = useState(false)

  const [currentFieldPath, setCurrentFieldPath] = useState('')

  const [modalState, setModalState] = useSetState({
    type: '',
    values: {},
  })

  const [spinLoading, setSpinLoading] = useState(true)

  const [submitLoading, setSubmitLoading] = useState(false)

  const location = useLocation()

  const { initialState, setInitialState,refresh } = useModel('@@initialState');

  const reFetchMenu = async () => {
    setInitialState({
      ...initialState,
      settings: {
        menu: {
          loading: true,
        }
      }
    })

    refresh()

    // const userMenu = await initialState?.fetchMenu?.()
    // if (userMenu) {
    //   setInitialState({
    //     ...initialState,
    //     currentMenu: userMenu,
    //   })
    // }
  }


  useEffect(() => {
    if (modalState.type) {
      setModalVisible(true)
    }
  }, [modalState.type])

  useEffect(() => {
    let stopMark = false;//避免在请求数据的过程中，突然切换页面，但是给表单赋值的代码还会执行，但是此时已经没有form了，这是就会报一个很大的错误
    if (location.pathname) {
      const getData = async () => {
        try {
          const res = await request(`${location.pathname.replace('/modal-design', '')}`);
          if (stopMark !== true) {
            setSpinLoading(false)
            modelDesignAction.setFormState((state) => {
              const { routeName, ...rest } = res.data.data;
              if (Object.keys(rest).length === 0) {
                state.initialValues = schemaExample
              }
              state.values = res.data.data
            })
          }
        } catch (error) {
          history.goBack()
        }
      }
      getData()
    }
    return () => {
      stopMark = true;
    }
  }, [location.pathname])


  const onSubmit = (values: any) => {
    setSubmitLoading(true)
    message.loading({ content: 'Processing...', key: 'process', duration: 0 })
    const updateData = async () => {
      try {
        const res = await request(`${location.pathname.replace('/modal-design', '')}`, {
          method: 'put',
          data: {
            data: values
          }
        }
        )
        if (res.success === true) {
          message.success({ content: res.message, key: 'process' })
          history.goBack()
          reFetchMenu()
        }
      } catch (error) {
        setSubmitLoading(false)
      }
    }
    updateData()

  }

  const { onFieldValueChange$, onFieldChange$ } = FormEffectHooks;

  const modelDesignEffect: IFormEffect = (_, { setFieldState, getFieldValue }) => {
    onFieldChange$('fieldsCard.fields.*.data').subscribe(({ path, active, value }) => {
      if (active === true) {
        setCurrentFieldPath(path as string);
        setModalState({
          values: value,
          type: getFieldValue(path?.replace('data', 'type'))
        })
        setModalVisible(true)
      }
    })
    onFieldValueChange$('fieldsCard.fields.*.type').subscribe(({ value, path }) => {
      if (value === 'switch' || value === 'radio') {
        setFieldState(path.replace('type', 'data'), (state: IFieldState) => {
          state.editable = true;
          state.required = true
        })
      } else {
        setFieldState(path.replace('type', 'data'), (state: IFieldState) => {
          state.editable = false;
          state.required = true
        })
      }
    })
    onFieldValueChange$('basicCard.routeName').subscribe(({ value }) => {
      setFieldState('*.*.*.uri', (state: { value: string; }) => {
        const arr = state.value?.split('/')
        state.value = state.value?.replace(arr[2], value)
      })
    })
  }

  const modalSubmitHandler = (values: any) => {
    setModalVisible(false)
    modelDesignAction.setFieldValue(currentFieldPath, values.data)

    setModalState({ type: '', values: {} })
  }
  return (
    <PageContainer>
      {spinLoading ? (<Spin className={styles.formSpin} tip="Loading..." />) : (
        <SchemaForm
          components={{ ArrayTable, Select, Input, Checkbox, Button }}
          onSubmit={onSubmit}
          // initialValues={schemaExample}
          effects={modelDesignEffect}
          actions={modelDesignAction}
          className={styles.formilyForm}
        >
          <FormCard title="Basic" name="basicCard">
            <Field
              title="Route Name"
              name="routeName"
              x-component="Input"
            ></Field>
          </FormCard>

          <FormCard title="Fields" name="fieldsCard">
            <Field type="array" x-component="ArrayTable" name='fields'
            >
              <Field type="object">
                <Field name="name" x-component="Input" title="Name" />
                <Field name="title" x-component="Input" title="Title" />
                <Field name="type" x-component="Select" title="Type" enum={enums.fieldType}></Field>
                <Field name="data" x-component="Button" title="Data"
                  x-component-props={{
                    children: 'Data',
                    // onClick:()=>{
                    //   setModalVisible(true)
                    // }
                  }}
                />
                <Field title='List Sorter' name="listSorter" x-component="Checkbox"></Field>
                <Field title='Hide InColumn' name="hideInColumn" x-component="Checkbox"></Field>
                <Field title='Edit Disabled' name="editDisabled" x-component="Checkbox"></Field>
              </Field>
            </Field>
          </FormCard>
          <FormCard title="Edit Action" name="editCard">
            <Field
              name="editAction"
              type="array"
              x-component="ArrayTable"
            >
              <Field type="object">
                <Field name="title" x-component="Input" title="Title" />
                <Field name="type" x-component="Select" title="Type" enum={enums.buttonType}></Field>
                <Field title='Action' name="action" x-component="Select" enum={enums.buttonAction}></Field>
                <Field title='Uri' name="uri" x-component="Input"></Field>
                <Field title='Method' name="method" x-component="Select" enum={enums.httpMethod}></Field>
              </Field>
            </Field>
          </FormCard>
          <FormCard title="Table Toolbar">
            <Field
              name="tableToolbar"
              type="array"
              x-component="ArrayTable"
            >
              <Field type="object">
                <Field name="title" x-component="Input" title="Title" />
                <Field name="type" x-component="Select" title="Type" enum={enums.buttonType}></Field>
                <Field title='Action' name="action" x-component="Select" enum={enums.buttonAction}></Field>
                <Field title='Uri' name="uri" x-component="Input"></Field>
                <Field title='Method' name="method" x-component="Select" enum={enums.httpMethod}></Field>
              </Field>
            </Field>
          </FormCard>
          <FormCard title="Batch Toolbar">
            <Field
              name="batchToolbar"
              type="array"
              x-component="ArrayTable"
            >
              <Field type="object">
                <Field name="title" x-component="Input" title="Title" />
                <Field name="type" x-component="Select" title="Type" enum={enums.buttonType}></Field>
                <Field title='Action' name="action" x-component="Select" enum={enums.buttonAction}></Field>
                <Field title='Uri' name="uri" x-component="Input"></Field>
                <Field title='Method' name="method" x-component="Select" enum={enums.httpMethod}></Field>
              </Field>
            </Field>
          </FormCard>

          <FormCard title="Batch Toolbar - Trashed">
            <Field
              name="batchToolbarTrashed"
              type="array"
              x-component="ArrayTable"
            >
              <Field type="object">
                <Field name="title" x-component="Input" title="Title" />
                <Field name="type" x-component="Select" title="Type" enum={enums.buttonType}></Field>
                <Field title='Action' name="action" x-component="Select" enum={enums.buttonAction}></Field>
                <Field title='Uri' name="uri" x-component="Input"></Field>
                <Field title='Method' name="method" x-component="Select" enum={enums.httpMethod}></Field>
              </Field>
            </Field>
          </FormCard>
          <Submit />

        </SchemaForm>)}
      <FooterToolbar extra={<Button
        type="primary"
        onClick={
          () => {
            modelDesignAction.submit()
          }
        }
        loading={submitLoading}
      >Submit</Button>} />
      <Modal
        modalVisible={modalVisible}
        hideModal={() => {
          setModalVisible(false)
          setModalState({ type: '', values: {} })
        }}
        modalSubmitHandler={modalSubmitHandler}
        modalState={modalState}
      />
    </PageContainer>
  )
}

export default Index
