# Kubernetes Deployment Configuration

Here is provided a sample configuration in order to deploy the IMT tool to a kubernetes cluster.

You can clone this folder, adjust the required configuration files and run the ./run-imt.sh script.
The scipt applies the yml configuration of the services provided in the namespace **modeltrainer**. Adjust accordingly.


# Configuration Files
The following files should be edited.

- ./kubernetes/db/postgres-configmap.yaml
	> POSTGRES_PASSWORD: ΧΧΧΧΧ

	Root password for the PostgreSQL database.

- ./kubernetes/config-files/api/config/app.envl
	> DB_PASSWORD=ΧΧΧΧΧ

	PostgreSQL password configured above.
	
- ./kubernetes/config-files/api/config/cors-stage.yml
	> allowed-origins:[ΧΧΧΧΧ]

	URL of the installation should be provider for CORS configuration. Ex. "https://imt.intelcomp.bsc.es"

- ./kubernetes/config-files/api/config/security-stage.yml
	> issuer-uri: ΧΧΧΧΧ

	Keycloak realm root URL.

	PostgreSQL password configured above.
	
- ./kubernetes/proxy/proxy-service.yaml
	> externalIPs:
	        - ΧΧΧΧΧ

	The external IP that will be binded to proxy for external connectivity.

- ./kubernetes/proxy/ProxyNginx.conf
	> server_name ΧΧΧΧΧ;

	Domain of the service.

- ./kubernetes/frontend/config.json
	```json
	"idp_service": {
		"address": "ΧΧΧΧΧ",
		"realm": "ΧΧΧΧΧ",
		"clientId": "ΧΧΧΧΧ",
		"redirectUri": "<fronend-root-url>/login/post",
		"scope": "ΧΧΧΧΧ"
	},
	```
	Address, realm, clientId, redirectUri and scope of the Keycloak instance used for authentication.

- ./kubernetes/config-files/api/config/event-scheduler-stage.yml
	> hdfsDataPath: "ΧΧΧΧΧ"
		hdfsServiceUrl: "ΧΧΧΧΧ"

	This part is for automatic import of corpuses from Data Catalogue. HDFS root path should provided at **hdfsServiceUrl** property and the relative HDFS path that need to be checked at the **hdfsServiceUrl** property. 