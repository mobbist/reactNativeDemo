/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
	Platform,
	StyleSheet,
	Text,
	View,
	WebView,
	Linking,
	toastShort,
	NavigatorIOS,
	Button,
	AlertIOS
} from 'react-native';
import axios from "axios"
import * as wechat from 'react-native-wechat'
const instructions = Platform.select({
	ios: 'Press Cmd+R to reload,\n' +
		'Cmd+D or shake for dev menu',
	android: 'Double tap R on your keyboard to reload,\n' +
		'Shake or press menu button for dev menu',
});
wechat.registerApp("wxb4ba3c02aa476ea1");


class WebViewH5 extends Component {

	handleMessage(e) {
		if (e.nativeEvent.data == "weixin") {
			//进行微信跳转
			Linking.canOpenURL('http://weixin.qq.com/').then((supported, err) => { // weixin://  alipay://
				if (supported) {
					this.setState({
						message: "进行微信跳转"
					})
					Linking.openURL('http://weixin.qq.com/');

				}
			});
		}
	}


	render() {
		return (
			<View style={styles.container}>

				<WebView
					ref={"webview"}
					style={styles.webView}
					source={{ url: "http://192.168.1.249:3000" }}
					automaticallyAdjustContentInsets={false}
					javaScriptEnabled={true}
					startInLoadingState={true}
					onMessage={(e) => {
						this.handleMessage(e)
					}}
				/>
			</View>

		);
	}
}
getUUID = () => {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 32; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4";
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);


	var uuid = s.join("");
	return uuid;
}

class NativeView extends Component {

	gotoPay() {
		wechat.isWXAppInstalled().then(result => {
			if (result) {
				axios({
					method: 'get',
					url: 'http://192.168.1.200:26081/api/v1/authentication/login',
					headers: {
						'x-api-key': '8bc64e5355bdb0bf9e839bac8a85d6f9f15881e302bb08ec5d11ad0315b547736dc5f0af5d8886f2b4ae34cff0d49a7c',
						'x-client-id': 'pLh7WmqpSYaApEww4uV3fQ',
					}
				}).then(function (response) {
					axios({
						method: 'post',
						url: 'http://192.168.1.200:26081/api/v1/payments/',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': "Bearer " + response.data.token,
						},
						data: {
							"amount": {
								"currency": "USD",
								"total": 0.01
							},
							//标识交易
							"mch_order_id": getUUID(),
							"payment_method": "wc_app",
							//唯一标识请求
							"request_id": getUUID(),
							"request_time": "2017-12-18T16:40:00+0800",
							"ttl": 600000,
							"short_description": "short description",
							"wc_app_data": {
								"true_client_ip": "1.1.1.1"
							}
						}
					}).then(res => {
						let data = res.data.wc_app_response

						wechat.pay({
							noncestr: "b65526e5abfc442ca8f88d7f211c6b09",
							package: "Sign=WXPay",
							partnerid: "12152566",
							prepayid: "wx20171219090614bb8ebe68500334891433",
							sign: "FD36DEDF3B318613BB0A2FF6F2174067",
							timestamp: 1513596937,
						}).then(err => {
							console.log("err:" + err);
						});
						// wechat.pay({
						// 	appid: data.appid,
						// 	partnerid: data.partnerid,  // 商家向财付通申请的商家id
						// 	prepayid: data.prepayid,   // 预支付订单
						// 	noncestr: data.noncestr,   // 随机串，防重发
						// 	timestamp: parseInt(data.timestamp),  // 时间戳，防重发
						// 	package: data.package,    // 商家根据财付通文档填写的数据和签名
						// 	sign: data.sign        // 商家根据微信开放平台文档对数据做的签名
						// }).then(err => {
						// 	console.log("err:" + err);
						// });
					})
				})
			} else {
				AlertIOS.alert('没有安装微信', '请先安装微信客户端在进行登录', [
					{ text: '确定' }
				])
			}

		})


	}
	render() {
		return (
			<View style={styles.container}>
				<Button onPress={this.gotoPay.bind(this)} title="IOSNative支付按钮" ></Button>
			</View>
		)
	}
}
export default class App extends Component {
	render() {
		return (
			<NavigatorIOS
				initialRoute={{
					component: NativeOrH5,
					title: 'IOS Native',
				}}
				style={{ flex: 1 }}
			/>
		);
	}
}

class NativeOrH5 extends Component {
	gotoWebView() {
		this.props.navigator.push({
			component: WebViewH5,
			title: 'WebView支付页面',
			rightButtonTitle: '取消',
			leftButtonTitle: "< 返回",
			onRightButtonPress: () => this.props.navigator.pop(),
			onLeftButtonPress: () => this.props.navigator.pop(),
		});
	}
	gotoNaitveView() {
		this.props.navigator.push({
			component: NativeView,
			title: 'IOSNative支付页面',
			rightButtonTitle: '取消',
			leftButtonTitle: "< 返回",
			onRightButtonPress: () => this.props.navigator.pop(),
			onLeftButtonPress: () => this.props.navigator.pop(),
		});
	}


	render() {
		return (
			<View style={styles.container}>
				<Button onPress={this.gotoNaitveView.bind(this)} title="IOSNative支付页面" ></Button>
				<Button onPress={this.gotoWebView.bind(this)} title="WebView支付页面" ></Button>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	webView: {
		height: 350,
		width: 375,
	},
});
