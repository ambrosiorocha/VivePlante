export default function About() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-green-900 mb-6">Sobre o Viveiro</h1>
            <div className="prose lg:prose-xl">
                <p className="mb-4">
                    Fundado em 2010, o <strong>Viveiro de Mudas</strong> nasceu da paixão pela natureza e do desejo de trazer mais verde para a vida das pessoas.
                    Localizado em uma área de 5.000m², cultivamos com carinho e técnica as melhores espécies para o seu jardim, pomar ou projeto paisagístico.
                </p>
                <p className="mb-4">
                    Nossa missão é promover a biodiversidade e o bem-estar através das plantas, oferecendo mudas saudáveis, substratos de qualidade e consultoria especializada.
                </p>
                <img
                    src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=2064&auto=format&fit=crop"
                    alt="Nosso Viveiro"
                    className="w-full h-96 object-cover rounded-xl mt-8 shadow-lg"
                />
            </div>
        </div>
    );
}
