import { genChartByAiUsingPOST } from '@/services/answerbi/chartController';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space, Upload, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';


const addChart: React.FC = () => {

  const onFinish = async (values: any) => {
    //对接后端，上传数据
    const params = {
      ...values,
      file: undefined,
    };
    try{
      //需要取到上传的原始数据 file->file->originFileObj
      const res = await genChartByAiUsingPOST(params, {}, values.file.file.originFileObj);
      //正常情况下，如果没有返回值就分析失败，有就分析成功
      if(!res?.data){
        message.error('分析失败');
      }else{
        message.success('分析成功');
      }
    }catch(e: any){
      //异常情况下，提示分析失败+具体失败原因
      message.error('分析失败,' + e.message);
    }
  };
  
  return (
    <div className='add-chart'>
      <Form
        name="addChart"
        onFinish={onFinish}
        initialValues={{  }}
      >
        <Form.Item 
          name="goal"
          label="分析目标"
          rules={[{ required: true, message: '请输入分析目标!' }]}
        >
          <TextArea placeholder='请输入你的分析需求，比如：分析网站用户的增长情况'/>
        </Form.Item>

        <Form.Item name="chartName" label="图表名称">
          <Input placeholder='请输入图表名称'/>
        </Form.Item>

        <Form.Item name="chartType" label="图表类型">
          <Select 
            placeholder="请选择图表类型"
            options={[
              {value: '折线图', label: '折线图'},
              {value: '柱状图', label: '柱状图'},
              {value: '堆叠图', label: '堆叠图'},
              {value: '饼图', label: '饼图'},
              {value: '雷达图', label: '雷达图'},
            ]}
          />            
        </Form.Item>

        <Form.Item name="file" label="上传原始数据">
          <Upload name="file">
            <Button icon={<UploadOutlined />}>上传EXCEL文件</Button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Space>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button htmlType="reset">重置</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};
export default addChart;
