import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  useDisclosure
} from '@chakra-ui/react'
import { Configuration, OpenAIApi } from 'openai'

export default function ReviewModal({ movieTitle }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [movieReview, setMovieReview] = useState()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const configuration = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
  })

  const openai = new OpenAIApi(configuration)

  const aiReview = async () => {
    try {
      const review = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Write a movie review for ${movieTitle} in eight sentences.`,
        temperature: 0.7,
        max_tokens: 120
      })
      setMovieReview(review.data.choices[0].text)
    } catch (e) {
      throw new Error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    aiReview()
  }, [])

  return (
    <>
      <Flex justify='space-evenly' align='flex-end'>
        <Button
          size='sm'
          width='8rem'
          margin={{ base: '1rem 0 3rem', md: '1.5rem 0 2rem' }}
          onClick={onOpen}
          isLoading={loading}
        >
          See Review
        </Button>
        <Button
          size='sm'
          width='8rem'
          margin={{ base: '1rem 0 3rem', md: '1.5rem 0 2rem' }}
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size='lg' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign='center'>
            🤖&nbsp; Movie Bot's Review &nbsp;🍿
          </ModalHeader>
          <ModalBody>{movieReview}</ModalBody>
          <ModalFooter>
            <Button margin='0 auto' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}