import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from "recharts";


import { Select, SelectItem } from "@nextui-org/react";
const baseURL = "http://localhost:3000";
export default function App() {
  const [sensores, setSensores] = useState([]);
  const [datasDisponiveis, setDatasDisponiveis] = useState();
  const [data, setData] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState()

  const [tamanho, setTamanho] = useState({
    largura: window.innerWidth,
    altura: window.innerHeight,
  });
  const atualizarTamanhoDaPagina = () => {
    setTamanho({
      largura: window.innerWidth,
      altura: window.innerHeight,
    });
  };
  useEffect(() => {
    window.addEventListener('resize', atualizarTamanhoDaPagina);

    return () => {
      window.removeEventListener('resize', atualizarTamanhoDaPagina);
    };
  }, []);
  useEffect(()=>{
    console.log(tamanho.altura);
  })

  useEffect(() => {
    // Função para buscar os sensores
    const fetchSensores = async () => {
      try {
        const response = await axios.get(baseURL);
        setSensores(response.data.Sensores);
      } catch (error) {
        alert("Erro ao conectar ao banco de dados");
      }
    };
  
    // Execute a função inicialmente
    fetchSensores();
  
    // Configura um intervalo para buscar os sensores a cada 1 minuto
    const intervalId = setInterval(fetchSensores, 60000);
  
    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    adicionarDados();
    pegarUltimoDia();
  }, [sensores]);

  function pegarUltimoDia(array = sensores) {
    if (array && array.length > 0) {
      const ultimaData = new Date(array[array.length - 1].DATA);
  
      // Obtém a data no formato "dd/mm/yyyy"
      const dataFormatada = ultimaData.toLocaleDateString();
  
      // Obtém a hora no formato "hh:mm:ss"
      const horaFormatada = ultimaData.toLocaleTimeString();
  
      // Combina a data e a hora no formato desejado
      const dataHoraFormatada = `${dataFormatada} ${horaFormatada}`;
  
      // Define a data e hora formatadas
      setDataSelecionada(dataHoraFormatada);
    } else {
      // Retorna undefined se o array estiver vazio
      return undefined;
    }
  }
  
  const adicionarDados = (dataSelecionada = new Date()) => {
    if (sensores) {
      const filteredData = sensores
      .filter(sensor => new Date(sensor.DATA).toDateString() === dataSelecionada.toDateString())
      .slice(-10)
        .map((sensor) => {
          const dataString = sensor.DATA;
          const data = new Date(dataString);
  
          const minutos = data.getMinutes();
          const horas = data.getHours();
  
          // Convertendo os valores para números (removendo "N/A")
          const temperatura = parseFloat(sensor.TEMP) || 0;
          const temperaturaP = parseFloat(sensor.TEMP_P) || 0;
          const umidade = parseFloat(sensor.UMIDADE) || 0;
  
          return { Hora: `${horas}:${minutos}`, Temperatura: temperatura, 'Temperatura Relativa': temperaturaP, Umidade: umidade };
        });
        setData([["Hora", "Temperatura", "Temperatura Relativa", "Umidade"], ...filteredData]);
  
      // Salvar os dias disponíveis
      var lastDia = new Date();
      const uniqueDays = [...new Set(sensores.map(sensor => {
        if (new Date(sensor.DATA).toLocaleDateString() !== lastDia) {
          lastDia = new Date(sensor.DATA).toLocaleDateString();
          return new Date(sensor.DATA)
  
        } else {
          return null;
        }
      }))];
      setDatasDisponiveis(uniqueDays);
    } else {
      alert("Dados não adquiridos");
    }
  };

  
  const temperaturaPrecisao = sensores.length > 0 ? sensores[sensores.length - 1].TEMP : "N/A";
  const temperatura = sensores.length > 0 ? sensores[sensores.length - 1].TEMP_P : "N/A";
  const umidade = sensores.length > 0 ? sensores[sensores.length - 1].UMIDADE : "N/A";
  return (
    <main className="bg-teal-100 max-h-screen min-w-96 w-screen min-h-screen rounded-xl lg:p-10 p-2">
      <div className="w-full h-auto bg-white rounded-xl md:p-4 pt-4">
        <h2 className="text-center text-teal-400 md:text-xl text-md">
         Dados
        </h2>
        <section className=" md:grid md:grid-cols-3 gap-4 pt-10 flex flex-col ">
          <div className="m-auto border-2 md:border-none md:p-4 p-6 rounded-xl">
            <p className="md:text-4xl text-xl text-center font-bold"> {temperaturaPrecisao} °C</p>
            <p className="text-center md:mt-4 md:border-2 rounded-xl md:py-1 md:px-8 text-md md?shadow-md">Temperatura</p >
          </div>
          <div className="m-auto border-2 md:border-none md:p-4 p-6 rounded-xl">
            <p className="md:text-4xl text-xl text-center font-bold">{temperatura} °C</p>
            <p className="text-center md:mt-4 md:border-2 rounded-xl md:py-1 md:px-8 text-md md:shadow-md">umidade Relativa</p >
          </div>
          <div className="m-auto border-2 md:border-none md:p-4 p-6 rounded-xl">
            <p className="md:text-4xl text-xl text-center font-bold">{umidade} %</p>
            <p className="text-center md:mt-4 md:border-2 rounded-xl md:py-1 md:px-8 text-md md:shadow-md">Umidade </p >
          </div>
        </section>
        <section className="md:mb-0 mb-10 w-full  md:h-auto flex flex-col justify-center items-center">
  {
    datasDisponiveis && datasDisponiveis.length > 0 && (
      <Select
        label="Selecione a data"
        onChange={(e) => {
          adicionarDados(new Date(datasDisponiveis[e.target.value]));
        }}
        className="md:w-96 w-80 m-auto mt-12 "
      >
        {datasDisponiveis.map((datas, index) => (
          datas ? (
            <SelectItem key={index} value={index} className="">
              {datas && new Date(datas).toLocaleDateString()}
            </SelectItem>
          ) : null
        ))}
      </Select>
    )
  }

  {data && (
    
    <LineChart
    width={tamanho.largura > 700?600: 400} // Set width to 100% to make it responsive
    height={300}
    className="mt-10"
    data={data.slice(1)}
     // Add the responsive prop
  >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Hora" />
      <YAxis />
      
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Temperatura" stroke="#8884d8" />
      <Line type="monotone" dataKey="Temperatura Relativa" stroke="#82ca9d" />
      <Line type="monotone" dataKey="Umidade" stroke="#ffc658" />
    </LineChart>
  )}
</section>
        <section>
          <p className="text-end  md:text-sm text-[10px] pr-4 md:pr-0 ">Ultima atualização {dataSelecionada}  </p>

        </section>
      </div>
    </main>
  );
}
