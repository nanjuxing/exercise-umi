import { useEffect } from 'react'
import { Modal as AntdModal, } from 'antd';
import { SchemaForm, SchemaMarkupField as Field, createAsyncFormActions } from '@formily/antd'
import { Input, ArrayTable, Select, Checkbox } from '@formily/antd-components'
import styles from './index.less'

const modalAction = createAsyncFormActions()

const Modal = ({ modalVisible, hideModal, modalSubmitHandler, modalState }: {
    modalVisible: boolean;
    hideModal: (reload?: boolean) => void; modalSubmitHandler: (value: any) => void;
    modalState: { type: string, values: Record<string, unknown> };
}) => {
    // useEffect(() => {
    //     if (modalVisible === false) {
    //         modalAction.setFormState((state) => {
    //             modalAction.reset()
    //         })
    //     }
    // }, [modalVisible])

    useEffect(() => {
        modalAction.reset()
        if (modalState.values) {
            modalAction.setFormState((state) => {
                state.values = {
                    data: modalState.values
                }
            })
        } else {
            modalAction.setFormState((state) => {
                state.value = {}
            })
        }
        if (modalState.type === 'switch') {
            modalAction.setFieldState('data', (state) => {
                state.props['x-component-props'] = {
                    operations: false,
                    renderAddition: () => null,
                }
            })
            modalAction.setFormState((state) => {
                console.log(state);

                state.values = {
                    data: [
                        {
                            title: 'Enabled',
                            value: 1,
                        },
                        {
                            title: 'Disabled',
                            value: 65,
                        }
                    ]
                }
            })
        } else {
            modalAction.setFieldState('data', (state) => {
                state.props['x-component-props'] = {

                }
            })
        }
    }, [modalState])

    return (
        <div>
            <AntdModal
                visible={modalVisible}
                onCancel={() => {
                    hideModal()
                }}
                onOk={() => {
                    modalAction.submit()
                }}
                maskClosable={false}
                forceRender
                focusTriggerAfterClose={false}
            >
                <SchemaForm
                    components={{ ArrayTable, Select, Input, Checkbox }}
                    className={styles.formilyForm}
                    actions={modalAction}
                    onSubmit={modalSubmitHandler}
                >

                    <Field
                        type="array"
                        x-component="ArrayTable"
                        name='data'
                        x-component-props={{
                            operations: false,
                            renderAddition: () => null
                        }}
                    >
                        <Field type="object">
                            <Field name="title" x-component="Input" title="title" />
                            <Field name="value" x-component="Input" title="Value" />
                        </Field>
                    </Field>

                </SchemaForm>
            </AntdModal>
        </div>
    )
}

export default Modal
