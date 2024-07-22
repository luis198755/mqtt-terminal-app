import React, { useState, useEffect, useRef } from 'react';
import { Client } from 'paho-mqtt';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AceEditor from 'react-ace';
import Ajv from 'ajv';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

const AdvancedPayloadEditor = ({ payload, onChange, onValidate, onSend }) => {
    const [editorValue, setEditorValue] = useState(payload);
    const [isValid, setIsValid] = useState(true);
    const ajv = new Ajv();
    const editorRef = useRef(null);
  
    useEffect(() => {
      if (editorRef.current) {
        const editor = editorRef.current.editor;
        editor.commands.addCommand({
          name: 'sendJsonMessage',
          bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
          exec: () => {
            if (isValid) {
              onSend(editorValue);
            }
          }
        });
      }
    }, [editorRef, isValid, editorValue, onSend]);
  
    const handleChange = (newValue) => {
      setEditorValue(newValue);
      onChange(newValue);
      validateJSON(newValue);
    };
  
    const validateJSON = (value) => {
      try {
        const parsedJSON = JSON.parse(value);
        const valid = ajv.validate({type: "object"}, parsedJSON);
        setIsValid(valid);
        onValidate(valid);
      } catch (error) {
        setIsValid(false);
        onValidate(false);
      }
    };
  
    return (
      <div className="mb-2">
        <AceEditor
          ref={editorRef}
          mode="json"
          theme="monokai"
          onChange={handleChange}
          value={editorValue}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          setOptions={{
            useWorker: false,
            showLineNumbers: true,
            tabSize: 2,
          }}
          style={{ width: '100%', height: '200px' }}
        />
        <div className={`mt-1 text-sm ${isValid ? 'text-green-500' : 'text-red-500'}`}>
          {isValid ? 'JSON is valid (Ctrl+Enter to send)' : 'Invalid JSON'}
        </div>
      </div>
    );
  };

const StatusBar = ({ connectionStatus, selectedTopic }) => (
    <div className="bg-black text-green-500 p-1 text-xs border-b border-green-500 flex justify-between">
      <span>mqtt@localhost:~$ MQTT Manager | Status: {connectionStatus}</span>
      <span>{selectedTopic ? `Selected Topic: ${selectedTopic}` : 'No topic selected'}</span>
    </div>
  );      

  const Sidebar = ({ topics, onAddTopic, onSelectTopic, selectedTopic }) => {
    const [newTopic, setNewTopic] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (newTopic.trim()) {
        onAddTopic(newTopic.trim());
        setNewTopic('');
      }
    };

    return (
        <div className="bg-black text-green-400 w-1/4 p-2 border-r border-green-500 flex flex-col h-full">
          <div className="mb-2">Subscribed Topics:</div>
          <div className="flex-grow overflow-y-auto">
            {topics.map((topic, index) => (
              <div 
                key={index} 
                className={`ml-2 cursor-pointer ${selectedTopic === topic ? 'text-yellow-500' : ''}`}
                onClick={() => onSelectTopic(topic)}
              >
                - {topic}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="mt-2">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="New topic"
              className="w-full bg-black text-green-500 border border-green-500 p-1"
            />
            <button type="submit" className="w-full bg-green-500 text-black mt-1 p-1">
              Subscribe
            </button>
          </form>
        </div>
      );
    };

    const MessageLog = ({ messages }) => {
        const messagesEndRef = useRef(null);
      
        const scrollToBottom = () => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };
      
        useEffect(scrollToBottom, [messages]);
      
        return (
          <div className="bg-black text-green-400 flex-grow p-2 overflow-y-auto font-mono">
            {messages.map((msg, index) => (
              <div key={index} className="mb-1">
                {msg.type === 'error' ? (
                  <span className="text-red-500">[ERROR] {msg.payload}</span>
                ) : msg.type === 'sent' ? (
                  <span className="text-blue-400">[SENT to {msg.topic}] {msg.payload}</span>
                ) : msg.type === 'received' ? (
                  <span className="text-green-400">[RECEIVED from {msg.topic}] {msg.payload}</span>
                ) : (
                  <span className="text-yellow-500">[SYSTEM] {msg.payload}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        );
      };

      const InputBar = ({ onSendMessage, selectedTopic, onPayloadTypeChange }) => {
        const [message, setMessage] = useState('');
        const [payloadType, setPayloadType] = useState('text');
        const [isPayloadValid, setIsPayloadValid] = useState(true);
      
        const handleSubmit = (msg) => {
          if (selectedTopic && msg.trim() && isPayloadValid) {
            onSendMessage(selectedTopic, msg.trim(), payloadType);
            setMessage(payloadType === 'json' ? '{\n\n}' : '');
          }
        };
      
        const handleKeyDown = (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(message);
          }
        };
      
        const handlePayloadTypeChange = (e) => {
          const newPayloadType = e.target.value;
          setPayloadType(newPayloadType);
          setMessage(newPayloadType === 'json' ? '{\n\n}' : '');
          onPayloadTypeChange(newPayloadType);
        };
      
        return (
          <div className="bg-black p-2 border-t border-green-500">
            <div className="mb-2">
              <select
                value={payloadType}
                onChange={handlePayloadTypeChange}
                className="bg-black text-green-500 border border-green-500 p-1"
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
              </select>
            </div>
            {payloadType === 'json' ? (
              <AdvancedPayloadEditor
                payload={message}
                onChange={setMessage}
                onValidate={setIsPayloadValid}
                onSend={handleSubmit}
              />
            ) : (
              <div className="flex items-center text-green-500">
                <span className="mr-2">mqtt@localhost:~$</span>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedTopic ? `Type message for ${selectedTopic}...` : 'Select a topic first'}
                  className="flex-grow bg-black text-green-500 focus:outline-none"
                  disabled={!selectedTopic}
                />
              </div>
            )}
          </div>
        );
      };

    const MQTTConfig = ({ config, onConfigChange, onConnect, onDisconnect, connectionStatus }) => {
        const handleChange = (e) => {
      const { name, value } = e.target;
      onConfigChange({ ...config, [name]: value });
    };
  
    const handleFileChange = (e) => {
      const { name, files } = e.target;
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onConfigChange({ ...config, [name]: event.target.result });
        };
        reader.readAsText(files[0]);
      }
    };
  
    return (
      <div className="bg-gray-900 text-green-400 p-2 border-b border-green-500">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="host"
            value={config.host}
            onChange={handleChange}
            placeholder="Broker Host"
            className="bg-black text-green-500 border border-green-500 p-1 text-sm flex-grow"
          />
          <input
            type="number"
            name="port"
            value={config.port}
            onChange={handleChange}
            placeholder="Port"
            className="bg-black text-green-500 border border-green-500 p-1 text-sm w-20"
          />
          <input
            type="text"
            name="username"
            value={config.username}
            onChange={handleChange}
            placeholder="Username"
            className="bg-black text-green-500 border border-green-500 p-1 text-sm w-32"
          />
          <input
            type="password"
            name="password"
            value={config.password}
            onChange={handleChange}
            placeholder="Password"
            className="bg-black text-green-500 border border-green-500 p-1 text-sm w-32"
          />
          <input
            type="text"
            name="clientId"
            value={config.clientId}
            onChange={handleChange}
            placeholder="Client ID"
            className="bg-black text-green-500 border border-green-500 p-1 text-sm w-40"
          />
          <select
            name="qos"
            value={config.qos}
            onChange={handleChange}
            className="bg-black text-green-500 border border-green-500 p-1 text-sm w-24"
          >
            <option value="0">QoS 0</option>
            <option value="1">QoS 1</option>
            <option value="2">QoS 2</option>
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="useSSL"
              checked={config.useSSL}
              onChange={(e) => handleChange({ target: { name: 'useSSL', value: e.target.checked } })}
              className="mr-2"
            />
            <label>Use SSL/TLS</label>
          </div>
          <div className="flex items-center">
          <input
            type="checkbox"
            name="useSecureWebSocket"
            checked={config.useSecureWebSocket}
            onChange={(e) => handleChange({ target: { name: 'useSecureWebSocket', value: e.target.checked } })}
            className="mr-2"
          />
          <label>Use Secure WebSocket</label>
        </div>
          {config.useSSL && (
            <>
              <input
                type="file"
                name="ca"
                onChange={handleFileChange}
                className="text-sm"
                accept=".pem,.crt"
              />
              <input
                type="file"
                name="cert"
                onChange={handleFileChange}
                className="text-sm"
                accept=".pem,.crt"
              />
              <input
                type="file"
                name="key"
                onChange={handleFileChange}
                className="text-sm"
                accept=".pem,.key"
              />
            </>
          )}
          <button
            onClick={onConnect}
            disabled={connectionStatus === 'Connected'}
            className="bg-green-500 text-black p-1 text-sm w-24 disabled:bg-gray-500"
          >
            Connect
          </button>
          <button
            onClick={onDisconnect}
            disabled={connectionStatus !== 'Connected'}
            className="bg-red-500 text-black p-1 text-sm w-24 disabled:bg-gray-500"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  };

  const MQTTManager = () => {
    const [client, setClient] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [topics, setTopics] = useState(['sensor/temperature', 'sensor/humidity', 'control/led']);
    const [messages, setMessages] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showGraph, setShowGraph] = useState(true);
    const [mqttConfig, setMqttConfig] = useState({
      host: 'broker.emqx.io',
      port: 8083,
      username: '',
      password: '',
      clientId: 'clientId-' + Math.random().toString(16).substr(2, 8),
      qos: 0,
      useSSL: false,
      useSecureWebSocket: window.location.protocol === 'https:',
      ca: null,
      cert: null,
      key: null
    });
  
    const connectMQTT = () => {
      if (client) {
        client.disconnect();
      }
  
      const protocol = mqttConfig.useSecureWebSocket ? 'wss' : 'ws';
      const port = mqttConfig.useSecureWebSocket ? (mqttConfig.port === 8083 ? 8084 : mqttConfig.port) : mqttConfig.port;
      
      const mqttClient = new Client(
        `${protocol}://${mqttConfig.host}:${port}/mqtt`,
        mqttConfig.clientId
      );
      
      mqttClient.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
          setConnectionStatus('Disconnected');
          setMessages(prev => [...prev, { type: 'error', payload: 'Connection lost: ' + responseObject.errorMessage }]);
        }
      };
  
      mqttClient.onMessageArrived = (message) => {
        setMessages(prev => [...prev, { 
          type: 'received', 
          topic: message.destinationName, 
          payload: message.payloadString 
        }].slice(-50));
      };
  
      const connectOptions = {
        onSuccess: () => {
          setConnectionStatus('Connected');
          topics.forEach(topic => mqttClient.subscribe(topic, { qos: parseInt(mqttConfig.qos) }));
          setMessages(prev => [...prev, { type: 'system', payload: 'Connected to MQTT broker' }]);
        },
        onFailure: (error) => {
          setConnectionStatus('Connection failed');
          setMessages(prev => [...prev, { type: 'error', payload: 'Connection failed: ' + error.errorMessage }]);
        },
        userName: mqttConfig.username,
        password: mqttConfig.password,
        useSSL: mqttConfig.useSSL || mqttConfig.useSecureWebSocket,
      };
  
      if (mqttConfig.useSSL) {
        connectOptions.sslProperties = {};
        if (mqttConfig.ca) connectOptions.sslProperties.ca = [mqttConfig.ca];
        if (mqttConfig.cert) connectOptions.sslProperties.cert = [mqttConfig.cert];
        if (mqttConfig.key) connectOptions.sslProperties.key = [mqttConfig.key];
      }
  
      mqttClient.connect(connectOptions);
      setClient(mqttClient);
    };
  
    const disconnectMQTT = () => {
      if (client && client.isConnected()) {
        client.disconnect();
        setConnectionStatus('Disconnected');
        setMessages(prev => [...prev, { type: 'system', payload: 'Disconnected from MQTT broker' }]);
      }
    };
  
    useEffect(() => {
      return () => {
        if (client && client.isConnected()) {
          client.disconnect();
        }
      };
    }, [client]);
  
    const handleAddTopic = (newTopic) => {
      if (client && client.isConnected()) {
        client.subscribe(newTopic, { qos: parseInt(mqttConfig.qos) });
        setTopics(prev => [...prev, newTopic]);
        setMessages(prev => [...prev, { type: 'system', payload: `Subscribed to ${newTopic}` }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', payload: 'Not connected to MQTT broker' }]);
      }
    };
  
    const handleSelectTopic = (topic) => {
      setSelectedTopic(topic);
    };
  
    const handleSendMessage = (topic, payload, payloadType) => {
      if (client && client.isConnected()) {
        let messageToSend = payload;
        if (payloadType === 'json') {
          try {
            messageToSend = JSON.stringify(JSON.parse(payload));
          } catch (error) {
            setMessages(prev => [...prev, { type: 'error', payload: 'Invalid JSON: ' + error.message }]);
            return;
          }
        }
        client.send(topic, messageToSend, parseInt(mqttConfig.qos), false);
        setMessages(prev => [...prev, { 
          type: 'sent', 
          topic: topic, 
          payload: messageToSend 
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', payload: 'Not connected to MQTT broker' }]);
      }
    };
  
    const handlePayloadTypeChange = (payloadType) => {
      setShowGraph(payloadType === 'text');
    };

  return (
    <div className="flex flex-col h-screen text-sm bg-black font-mono">
      <StatusBar connectionStatus={connectionStatus} selectedTopic={selectedTopic} />
      <MQTTConfig
        config={mqttConfig}
        onConfigChange={setMqttConfig}
        onConnect={connectMQTT}
        onDisconnect={disconnectMQTT}
        connectionStatus={connectionStatus}
      />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          topics={topics} 
          onAddTopic={handleAddTopic} 
          onSelectTopic={handleSelectTopic}
          selectedTopic={selectedTopic}
        />
        <div className="flex flex-col flex-grow overflow-hidden">
          <MessageLog messages={messages} />
          <MessageGraph 
            messages={messages} 
            selectedTopic={selectedTopic} 
            visible={showGraph}
          />
          <InputBar 
            onSendMessage={handleSendMessage} 
            selectedTopic={selectedTopic}
            onPayloadTypeChange={handlePayloadTypeChange}
          />
        </div>
      </div>
    </div>
  );
};


const MessageGraph = ({ messages, selectedTopic, visible }) => {
    const filteredMessages = messages
      .filter(msg => msg.topic === selectedTopic && msg.type === 'received' && !isNaN(parseFloat(msg.payload)))
      .slice(-20)
      .map((msg, index) => ({
        index,
        value: parseFloat(msg.payload)
      }));

      if (!visible) return null;

  
      return (
        <div className="bg-gray-900 p-2 border-t border-green-500 h-1/3 min-h-[200px]">
        <h3 className="text-green-500 mb-2">Graph for {selectedTopic}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredMessages}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="index" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
              labelStyle={{ color: '#8884d8' }}
            />
            <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

export default MQTTManager;