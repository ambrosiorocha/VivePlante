import { Shovel, Ruler, PenTool } from 'lucide-react';

export default function Services() {
    const services = [
        {
            title: "Projetos de Paisagismo",
            desc: "Transformamos seu espaço em um refúgio verde. Projetos para residências, condomínios e empresas.",
            icon: <PenTool className="h-12 w-12 text-green-600" />
        },
        {
            title: "Jardinagem e Manutenção",
            desc: "Cuidamos do seu jardim com poda, adubação e controle de pragas. Planos mensais disponíveis.",
            icon: <Shovel className="h-12 w-12 text-green-600" />
        },
        {
            title: "Consultoria Técnica",
            desc: "Análise de solo e indicação das melhores espécies para cada ambiente e clima.",
            icon: <Ruler className="h-12 w-12 text-green-600" /> // using ruler as placeholder
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-green-900 mb-12 text-center">Nossos Serviços</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-xl shadow-md border-t-4 border-green-500 hover:-translate-y-1 transition duration-300">
                        <div className="mb-6">{service.icon}</div>
                        <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                        <p className="text-gray-600">{service.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
