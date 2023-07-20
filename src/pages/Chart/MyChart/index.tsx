import { listMyChartByPageUsingPOST } from '@/services/answerbi/chartController';
import { useModel } from '@umijs/max';
import { Avatar, Card, List, message } from 'antd';
import Search from 'antd/es/input/Search';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';


const MyChartPage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 4,
  }

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});

  const [chartList,setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  //页面加载状态
  const [loading, setLoading] = useState<boolean>(true);

  //从全局状态中获取当前登录用户信息
  const { initialState } = useModel('@@initialState')
  const { currentUser } = initialState ?? {};
  //获取数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);

      if(res.data){
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        //去除图表标题
        if(res.data.records){
          res.data.records.forEach(data => {
            const chartOption = JSON.parse(data.genChart ?? '{}');
            chartOption.title = undefined;
            data.genChart = JSON.stringify(chartOption);
          })
        }
      }else{
        message.error('获取我的图表失败');
      }
    } catch (e : any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  }
  
  //首次加载页面时，触发加载数据
  useEffect(() => {
    //这个页面首次渲染的时候，以及这个数组中的搜索条件发生变化的时候，会执行loadData方法，自动触发重新搜索
    loadData();
  },[searchParams]);


  return (
    <div className='my-chart-page'>
      <div>
        <Search placeholder="请输入图表名称" enterButton loading={loading} onSearch={(value) => {
          setSearchParams({
            ...initSearchParams,
            chartName: value,
          })
        }}/>
      </div>
      <div className='margin-16'/>
      <List
        /*
          栅格间隔16像素；
          xs屏幕<576px,栅格数1；
          sm屏幕≥576px,栅格数1；
          md屏幕≥768px,栅格数1；
          lg屏幕≥992px,栅格数2；
          xl屏幕≥1200px,栅格数2；
          xxl屏幕≥1660px,栅格数2
        */
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        loading={loading}
        dataSource={chartList}
        footer={
          <div>
            <b>ant design</b> footer part
          </div>
        }
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: '100%' }}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                title={item.chartName}
                description={item.chartType ? '图表类型' + item.chartType : undefined}
              />
              <div style={{ marginBottom: 16 }} />
              {'分析目标' + item.goal}
              <div style={{ marginBottom: 16 }} />
              <ReactECharts option={JSON.parse(item.genChart ?? '{}')}></ReactECharts>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};
export default MyChartPage;
