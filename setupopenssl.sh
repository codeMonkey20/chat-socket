echo "Generate a Private Key"
openssl genrsa -out key.pem
echo "Create a Certificate Signing Request (CSR)"
openssl req -new -config openssl.cnf -key key.pem -out csr.pem 
echo "Generate a Self-Signed Certificate"
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem