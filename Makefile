# Instala/configura as necessidades do dockerfile
file:
	docker build -t dockerfile . 

# levanta o docker-compose.
up:
	docker-compose up

# para o compose.
stop:
	docker-compose stop

# derruba container, seus volumes e algo que seja relacionado a ele.
# remove a imagem criada pelo docker-compose.
kill:
	docker-compose down --volumes --remove-orphans
	docker rmi nest_01_echarts-back

# executa o stop e o kill
down:
	make stop
	make kill

remake:
	make stop
	make kill
	docker-compose up

edit:
	make down
	make up