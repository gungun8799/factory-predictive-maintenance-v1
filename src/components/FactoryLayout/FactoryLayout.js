import React, { useEffect, useState, useRef } from 'react';
import './FactoryLayout.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FactoryLayout = () => {
  const [statusData, setStatusData] = useState({});
  const [statusCounts, setStatusCounts] = useState({ normal: 0, warning: 0, critical: 0 });
  const mountRef = useRef(null);
  const statusLightsRef = useRef({});
  const localStorageKey = 'statusLights';

  const fetchData = () => {
    fetch('https://harveypredictive.work.gd:8080/data/')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data from Postgres:', data);
        if (data && data.data) {
          const parsedData = data.data.reduce((acc, item) => {
            const key = `${item.equipment}`.replace(' ', '_');
            if (!acc[key]) acc[key] = [];
            acc[key].push(item.prediction);
            return acc;
          }, {});
          console.log('Parsed status data:', parsedData);
          setStatusData(parsedData);
          localStorage.setItem(localStorageKey, JSON.stringify(parsedData));
        }
      })
      .catch(error => console.error('Error fetching data from Postgres:', error));
  };

  useEffect(() => {
    const savedStatusData = localStorage.getItem(localStorageKey);
    if (savedStatusData) {
      setStatusData(JSON.parse(savedStatusData));
    } else {
      fetchData();
    }
    const intervalId = setInterval(fetchData, 10000); // Fetch every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e8eaf4');

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.2, 100);
    camera.position.set(3, 22, -30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    directionalLight1.position.set(10, 10, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10.8);
    directionalLight2.position.set(-10, -10, -10);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 5.8, 100);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    const loader = new GLTFLoader();
    loader.load('https://gungun8799.github.io/factory-predictive-maintenance-v1/assets/4_predictive-maintenance-model.glb', (gltf) => {
      const model = gltf.scene;

      const positions = {
        "Machine_1_Equipment_1": [-30, 5, -8],
        "Machine_1_Equipment_2": [-30, 5, -5],
        "Machine_1_Equipment_3": [-32.5, 7, -6],
        "Machine_2_Equipment_1": [-26, 5, -10],
        "Machine_2_Equipment_2": [-22.5, 5, -9],
        "Machine_2_Equipment_3": [-15.5, 6, -9],
        "Machine_3_Equipment_1": [-4.5, 4, -7],
        "Machine_3_Equipment_2": [-1, 3, -7],
        "Machine_3_Equipment_3": [1, 4, -7],
        "Machine_4_Equipment_1": [12, 18, -12],
        "Machine_4_Equipment_2": [15, 18, -12],
        "Machine_4_Equipment_3": [13, 12, -12],
        "Machine_5_Equipment_1": [27, 10, -4],
        "Machine_5_Equipment_2": [27, 10, -8],
        "Machine_5_Equipment_3": [34, 5, -8],
      };

      for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 3; j++) {
          const lightName = `Machine_${i}_Equipment_${j}`;
          const statusLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x808080 })
          );

          const object = model.getObjectByName(`Machine_${i}_Equipment_${j}`);
          if (object) {
            statusLight.position.set(...positions[lightName]);
            scene.add(statusLight);
            statusLightsRef.current[lightName] = statusLight;
          } else {
            scene.add(statusLight);
            statusLightsRef.current[lightName] = statusLight;
          }
        }
      }

      scene.add(model);
      model.position.y -= 10;
      model.position.z -= 10;
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (Object.keys(statusData).length === 0) {
      console.log("No data detected");
    } else {
      console.log('statusData:', statusData);
    }

    let normalCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    const lastStatus = JSON.parse(localStorage.getItem(localStorageKey)) || {};

    Object.keys(statusLightsRef.current).forEach((name) => {
      const light = statusLightsRef.current[name];
      const statuses = statusData[name] || lastStatus[name];

      console.log(`Light: ${name}, Statuses:`, statuses);
      if (statuses && statuses.length > 0) {
        const count = statuses.length;
        const criticalPredCount = statuses.filter(s => s === 1).length;
        const criticalPercentage = (criticalPredCount / count) * 100;
        console.log(`Critical Percentage for ${name} is: ${criticalPercentage}`);

        if (criticalPercentage > 50) {
          light.material.color.setHex(0xff0000);
          criticalCount++;
        } else if (criticalPercentage > 30) {
          light.material.color.setHex(0xffa500);
          warningCount++;
        } else {
          light.material.color.setHex(0x00ff00);
          normalCount++;
        }
        lastStatus[name] = statuses;
      } else {
        const lastStatusColor = lastStatus[name]?.[0];
        if (lastStatusColor === 1) {
          light.material.color.setHex(0xff0000);
        } else if (lastStatusColor === 2) {
          light.material.color.setHex(0xffa500);
        } else {
          light.material.color.setHex(0x00ff00);
        }
      }
    });

    setStatusCounts({ normal: normalCount, warning: warningCount, critical: criticalCount });

    localStorage.setItem(localStorageKey, JSON.stringify(lastStatus));

    const blinkInterval = setInterval(() => {
      Object.keys(statusLightsRef.current).forEach((name) => {
        const light = statusLightsRef.current[name];
        if (light && statusData[name] && statusData[name].length > 0) {
          const count = statusData[name].length;
          let criticalPredCount = statusData[name].filter(s => s === 1).length;
          const criticalPercentage = (criticalPredCount / count) * 100;

          if (criticalPercentage > 50 || criticalPercentage > 30) {
            light.visible = !light.visible;
          }
        }
      });
    }, 500);

    return () => clearInterval(blinkInterval);
  }, [statusData]);

  return (
    <div className="factory-layout">
      <h3>Digital Twin Machine Monitoring</h3>
      <div className="status-legend">
        <span className="status-circle status-green"></span> : Normal ({statusCounts.normal})&nbsp;
        <span className="status-circle status-orange"></span> : Warning ({statusCounts.warning})&nbsp;
        <span className="status-circle status-red"></span> : Critical ({statusCounts.critical})
      </div>
      <div className="layout-placeholder" ref={mountRef}></div>
    </div>
  );
};

export default FactoryLayout;
